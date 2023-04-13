<template>
    <div
      v-loading="loading"
      class="personal-center-container"
      style="display: flex;justify-content: space-around;"
    >
      <!-- 选择 - 修改信息用户 -->
      <el-scrollbar
        height="70vh"
        style="width: 20%;"
      >
        <!-- 绑定需要激活的 人员信息 传入一个数组 -->
        <el-collapse
          v-model="activeGroups"
          style="border-bottom: none;padding-right: 10px;"
        >
          <el-collapse-item
            v-for="userGroup in userGroups"
            :key="userGroup._id"
            :title="userGroup._id"
            :name="userGroup._id"
          >
          <!-- userGroup.users里面就一个对象，相当于简写这里 -->
            <div
              v-for="user in userGroup.users"
              :key="user.account"
              class="user-group__item"
              @click="selectUser(user)"
              :class="{'user-group__item--active': selectingUserAccount === user.account}"
            >
              <div style="display: flex;align-items: center;">
                <UserAvatar
                  :size="10"
                  style="margin-right: 5px;"
                />
                <span>{{ user.username }}</span>
              </div>
              <span
                v-if="isSelf(user.account)"
                style="color: #999;font-size: 12px;margin-right: 6px;"
              >
                本人
              </span>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
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
              :size="108"
            />
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
      const showingUserAccount = ref(null)
      const selectingUserAccount = ref(null)
      return {
        activeGroups,
        userGroups,
        userInfo,
        username,
        editingUsername,
        loading,
        ROLE_LIST,
        showingUserAccount, // 右边显示的用户
        selectingUserAccount // 点击选中的用户 浅蓝背景效果
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
      // 点击触发，当前浅蓝背景和右边信息，获取当前详细信息
      async selectUser (user) {    
        this.selectingUserAccount = user.account        
        this.showingUserAccount = user.account
        // getUserInfo 就是获取右边 showingUserAccount的信息
        await this.getUserInfo()
      },

      // 判断是否为本人标识
      isSelf (userAccount) {
        return userAccount === this.userAccount
      },

      // 获取所有人员信息
      async getUserGroups () {
        this.loading = true
        const res = await this.$api.getUserGroups()        
        this.userGroups = res.data
        this.loading = false
      },
      // 获取右边显示的用户信息
      async getUserInfo () {
        this.loading = true
        const res = await this.$api.getUserInfo({ account: this.showingUserAccount })
        this.userInfo = res.data
        if (this.showingUserAccount === this.userAccount) {
          this.$store.commit('setUser', res.data)
        }
        this.loading = false
      },
      // 编辑用户名
      async editOrSaveUsername () {
        if (this.editingUsername) { 
          if (this.username) {
            this.userInfo.username = this.username
            await this.updateUserInfo()
          } else {
            this.$message({
              type: 'error',
              message: '用户名不能为空'
            })
          }
        } else { 
          this.username = this.userInfo.username
        }
        this.editingUsername = !this.editingUsername
        // this.loading = true
        // await this.getUserInfo()
        // this.loading = false
      },

      // 修改名字和职位都要调用 不调用不是实时更新
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
  