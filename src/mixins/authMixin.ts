import { defineComponent } from 'vue'
import { ROLE_LIST } from '@/constants/constants'

export default defineComponent({
  computed: {
    userRole () {
      return this.$store.state.user.role
    }
  },
  methods: {
    //判断当前角色是否有传入字段权限
    hasAuth (actionAuth:String) {
      if (!this.userRole) {
        return false
      }
      // if (Array.isArray(actionAuth)) {
      //   return actionAuth.some(auth => {
      //     return ROLE_LIST[this.userRole].auth.includes(auth)
      //   })
      // }
      return ROLE_LIST[this.userRole].auth.includes(actionAuth)
    },
    isOperator (operatorAccount) {
      return this.$store.state.user.account === operatorAccount
    }
  }
})
