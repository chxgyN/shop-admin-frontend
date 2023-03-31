<template>
  <div
    v-loading="loading"
    class="personal-center-container"
    style="display: flex;justify-content: space-around;"
  >
    <el-card
      shadow="hover"
      style="width: 60%;"
    >
      <div 
        class="user-info-wrapper"
        style="display: flex;align-items: center;flex-direction: column;min-width: 400px;"
      >
        <div
          class="user-info__avatar-wrapper user-info__item-wrapper"
          style="height: 170px;"
        >
          <UserAvatar
            :size="120"
          />
          <!-- <UserAvatar
            :size="80"
            :avatar="userInfo.avatar"
          /> -->
          <!-- <el-upload
            action="#"
            :before-upload="beforeProductImageUpload"
          >
            <el-button size="small">
              上传头像
            </el-button>
          </el-upload> -->
        </div>
        <el-divider
          style="margin: 20px 0;"
        />
        <div
          class="user-info__other-info-wrapper user-info__item-wrapper"
          style="font-size: 14px;align-items: start;height: 180px;width: 50%;margin: 0 auto;"
        >
          <div>账号：{{ userInfo.account }}</div>
          <div>
            用户名：
            <el-input
              v-if="editingUsername"
              v-model="username"
              size="mini"
              style="width: 50%;"
              placeholder="请输入用户名"
            />
            <span v-else>{{ userInfo.username }}</span>
            <el-button
              style="margin-left: 5px;"
              type="primary"
              :icon="editingUsername ? 'el-icon-check' : 'el-icon-edit'"
              size="mini"
              circle
              @click="editOrSaveUsername"
            />
          </div>
          <!-- 职位是否可选择 -->
          <div>
            <span>职位：</span>
            <el-select
              v-if="editingUsers"
              v-model="userInfo.role"
              style="width: 50%;"
              size="mini"
              :disabled="userAccount === showingUserAccount"
              placeholder="请选择职位"
              @change="updateUserInfo"
            >
              <el-option
                v-for="item in Object.keys(ROLE_LIST)"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <span v-else>{{ userInfo.role }}</span>
          </div>
          <div>入职时间：{{ userInfo.entryTime }}</div>
        </div>
      </div> 
    </el-card>
  </div> 
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import { ROLE_LIST } from '@/constants/constants'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default defineComponent({
  name: 'PersonalCenter',
  components: {
    UserAvatar
  },
  props: {
    editingUsers: {
      type: Boolean,
      default: false
    }
  },
  setup () {
    const activeGroups = ref(Object.keys(ROLE_LIST))
    const userGroups = ref([])
    const userInfo = ref({})
    const username = ref<string>('')
    const editingUsername = ref<boolean>(false)
    const loading = ref<boolean>(false)
    const chatPartner = ref(null)
    const chatContents = ref([])
    const chattingContent = ref('')
    const showingUserAccount = ref(null)
    const selectingUserAccount = ref(null)
    return {
      activeGroups,
      userGroups,
      userInfo,
      username,
      editingUsername,
      loading,
      chatPartner,
      chatContents,
      chattingContent,
      showingUserAccount, // 显示的用户
      ROLE_LIST,
      selectingUserAccount // 点击选中的用户
    }
  },
  computed: {
    userAccount () {
      return this.$store.state.user.account
    }
  },
  async created () {
    this.showingUserAccount = this.userAccount
    this.selectingUserAccount = this.userAccount
    await this.getUserInfo()
    await this.getUserGroups()
    this.$socket.on('someUserUpdate', async () => {
      await this.getUserGroups()
    })
  },
  methods: {
    async selectUser (user) {
      this.selectingUserAccount = user.account
      if (this.editingUsers) {
        this.showingUserAccount = user.account
        await this.getUserInfo()
      } else {
        if (user.account === this.userAccount) {
          this.chatPartner = null
        } else {
          this.selectChatPartner(user)
        }
      }
    },
    isSelf (userAccount) {
      return userAccount === this.userAccount
    },
    async getUserGroups () {
      this.loading = true
      const res = await this.$api.getUserGroups()
      this.userGroups = res.data
      this.loading = false
    },
    async editOrSaveUsername () {
      if (this.editingUsername) { // 保存
        if (this.username) {
          this.userInfo.username = this.username
          await this.updateUserInfo()
        } else {
          this.$message({
            type: 'error',
            message: '用户名不能为空'
          })
        }
      } else { // 编辑
        this.username = this.userInfo.username
      }
      this.editingUsername = !this.editingUsername
      this.loading = true
      await this.getUserGroups()
      this.loading = false
    },
    async getUserInfo () {
      this.loading = true
      const res = await this.$api.getUserInfo({ account: this.showingUserAccount })
      this.userInfo = res.data
      // console.log("@@"+res.data);
      
      if (this.showingUserAccount === this.userAccount) {
        this.$store.commit('setUser', res.data)
      }
      this.loading = false
    },
    // beforeProductImageUpload (file: any) {
    //   // 将上传的图片转为base64格式
    //   const reader = new FileReader()
    //   reader.onload = async (e) => {
    //     this.userInfo.avatar = e.target.result
    //     await this.updateUserInfo()
    //     await this.getUserInfo()
    //   }
    //   reader.readAsDataURL(file)
    //   return false // 屏蔽默认上传
    // },
    async updateUserInfo () {
      await this.$api.updateUserInfo({
        ...this.userInfo,
        operatorAccount: this.$store.state.user.account
      })
      this.$socket.emit('userUpdate')
      await this.getUserGroups()
    }
  }
})
</script>

<style lang="scss" scoped>
.user-info__item-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
:deep(.el-divider) {
  background-color: #EBEEF5;
}
.user-group__item {
  line-height: 30px;
  padding: 0 10px;
  height: 30px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  &.user-group__item--active {
    background: #ecf5ff;
  }
}
.chatting-content__tip-words {
  text-align: center;
  font-size: 12px;
  color: #999;
}
</style>
