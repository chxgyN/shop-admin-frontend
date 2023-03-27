import { useStore } from "vuex"
export default function(operatorAccount){
    const store = useStore()
    return store.state.user.account === operatorAccount
}