<template>
  <div class="login-page-container">
    <img src="@/assets/imgs/Shopping_Bags.png" class="login-cover" />
    <el-card class="login-card">
      <template #header>
        <div class ="login-title">
          零食量贩店进销存系统
        </div>
      </template>
      <div
        class="form-content-container"
      >
        <!-- 登录表单 -->
        <el-form
          ref="LoginForm"
          :rules="loginFormRules"
          :model="loginForm"
          label-width="80px"
          label-position="left"
        >
          <el-form-item
            label="账号"
            prop="account"
          >
            <el-input
              v-model="loginForm.account"
              placeholder="请输入手机号或邮箱"
            />
          </el-form-item>
          <el-form-item
            label="密码"
            prop="password"
          >
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item
            label="记住我"
            prop="rememberUser"
          >
            <el-switch v-model="loginForm.rememberUser" />
          </el-form-item>
          <el-button
            size="medium"
            style="width: 100%;"
            @click="login"
          >
            登录
          </el-button>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { loginForm, loginFormRules } from './loginFormModel'
import { saveUserToLocal,userToVuex } from '@/utils'
import CryptoJS from 'crypto-js'
import initDynamicRoutes from '@/hook/initDynamicRoutes'

export default defineComponent({
  name: 'Login',
  setup () {
    const loginFormRef = reactive(loginForm)
    return {
      loginForm: loginFormRef,
      loginFormRules
    }
  },
  methods: {
    // async login () {
    login() {
      this.$refs.LoginForm.validate(async (isValid: boolean) => {
        if (isValid) {
          const res = await this.$api.login({
            account: this.loginForm.account,
            password: CryptoJS.MD5(this.loginForm.password).toString()
          })
          // console.log(res);
          
          if (res.code === 0) {
            const user = {
              account: this.loginForm.account,
              password: this.loginForm.password,
              username: res.data.username,
              // avatar: res.data.avatar,
              role: res.data.role,
              token:res.data.token
            }
            
            if (this.loginForm.rememberUser) {
              // 记住用户
              saveUserToLocal(user)
            }
            else{
              userToVuex(user)
            }
            
            // console.log("@"+user.password);
            // console.log("@@"+this.$store.state.user.password);
            this.$refs.LoginForm.resetFields()
            initDynamicRoutes()
          
            // 跳转首页
            setTimeout(() => {
              this.$router.push({ path: '/' })
            }, 500)
          }
        } else {
          return false
        }
      })
    }
  }
})
</script>

<style lang="scss">
.login-page-container {
  position: relative;
  .login-cover{
    transform: scale(0.75);
  }
  .login-card{
    width: 400px;
    position: absolute;
    top: 50%;
    left: 70%;
    transform: translateX(-50%) translateY(-50%);
    .login-title{
      text-align: center;
    }
    .form-content-container{
      padding: 0 20px
    }
  }

}
</style>
