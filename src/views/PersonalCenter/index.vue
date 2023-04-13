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
          <UserAvatar :size = '120'/>
        </div>
        <el-divider
          style="margin: 20px 0;"
        />
        <div
          class="user-info__other-info-wrapper user-info__item-wrapper"
          style="font-size: 14px;align-items: start;height: 180px;width: 50%;margin: 0 auto;"
        >
          <div>
            账号：{{ userInfo.account }}
          </div>
          <div>
            用户名：
            <el-input
              ref="input"
              v-if="editingUsername"
              v-model="inputUsername"
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
          <div>
            <span>职位：</span>
            <span>
              {{ userInfo.role }}
            </span>
          </div>
          <div>
            入职时间：{{ userInfo.entryTime }}
          </div>
        </div>
      </div> 
    </el-card>
  </div> 
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import UserAvatar from '@/components/common/UserAvatar.vue'

dayjs.extend(relativeTime)

export default defineComponent({
  name: 'PersonalCenter',
  components:{
    UserAvatar
  },
  props: {
    editingUsers: {
      type: Boolean,
      default: false
    }
  },
  setup () {
    const userInfo = ref({})
    const inputUsername = ref<string>('')
    const editingUsername = ref<boolean>(false)
    const loading = ref<boolean>(false)

    return {
      userInfo,
      inputUsername,
      editingUsername,
      loading,
    }
  },

  computed: {
    userAccount () {
      return this.$store.state.user.account
    }
  },
  async created () {
    await this.getUserInfo()
  },
  methods: {
    async getUserInfo () {   
      this.loading = true
      const res = await this.$api.getUserInfo({ account: this.userAccount })
      this.userInfo = res.data
      this.loading = false
    },

    // 一进来 editingUsername 是 false 进入编辑
    async editOrSaveUsername () {  
      // 保存  
      if (this.editingUsername) { 
        if (this.inputUsername) {
          this.userInfo.username = this.inputUsername
          this.$store.commit('setUser', this.userInfo)
          await this.updateUserInfo()
        } 
        else {        
          this.$message({
            type: 'error',
            message: '用户名不能为空'
          })
        }
      } 
      // 编辑
      // input初始值等于一上来获取的 username
      else {  
        setTimeout(() => {
          this.$refs.input.focus();
        }, 0);
        this.inputUsername = this.userInfo.username
      }
      // 更改状态 再次点击进入此函数 会进入if
      this.editingUsername = !this.editingUsername
    },
  
    async updateUserInfo () {
      await this.$api.updateUserInfo({
        ...this.userInfo,
        operatorAccount: this.$store.state.user.account
      })
      // ？？触发后端用户信息更新函数
      this.$socket.emit('userUpdate')
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
