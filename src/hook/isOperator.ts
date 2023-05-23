import { useStore } from "vuex"

// 有权限账号vuex信息因为某种情况没清洗，然后无权限角色进行非法操作
export default function(operatorAccount){
    const store = useStore()
    return store.state.user.account === operatorAccount
}