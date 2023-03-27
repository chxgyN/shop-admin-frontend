import { ROLE_LIST } from '@/constants/constants'
import { useStore } from 'vuex'

//判断当前角色是否有传入字段权限
export default function(permissions:String) {
    const store = useStore()
    const role = store.state.user.role
    if(!role){
        return false
    }
    // includes可以判断数组，可以判断字符串 是否包含 permissions
    return ROLE_LIST[role].auth.includes(permissions)
}

