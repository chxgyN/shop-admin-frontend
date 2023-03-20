import { createStore } from 'vuex'
import { UserState, RootState } from './types'
// import state from './state'
// import mutations from './mutations'
// import getters from './getters'

const user: UserState = {
  account: '',
  username: '',
  avatar: '',
  role: '',
  entryTime: ''
}

const mutations = {
  setUser(state: RootState, user: UserState) {
    // console.log("@@"+JSON.stringify(user));
    state.user = user
  }
}

const state: RootState = {
  user,
  socketConnected: false
}
 
const getters = {
  getUser(state: RootState){
    state.user
  }
}

export default createStore({
  mutations,
  state,
  getters
})