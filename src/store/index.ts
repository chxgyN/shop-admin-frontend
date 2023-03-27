import { createStore } from 'vuex'
import { UserState, RootState } from './types'

const user: UserState = {
  account: '',
  username: '',
  // avatar: '',
  role: '',
  entryTime: '',
  // password: '',
  token:'',
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