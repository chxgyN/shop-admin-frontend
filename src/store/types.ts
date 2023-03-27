export interface UserState {
  account?: string,
  username?: string,
  // avatar?: string,
  role?: string,
  entryTime?: string,
  // password?:string,
  token?:string
}

export interface RootState {
  user: UserState,
  socketConnected: boolean
}
