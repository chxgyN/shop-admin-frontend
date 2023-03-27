import { responseDataType, requestDataType } from '../types/request'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store/index'
import authMixin from '@/mixins/authMixin'

axios.defaults.timeout = 20000
axios.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8'
const BASE_URL = 'http://localhost:3000'

//req请求对象必须返回 不然请求发送不出去
axios.interceptors.request.use(
  config => {
    if (store.state.user.token) {
      // 如果本地存有token 设置权限请求头 请求权限数据
      config.headers['Authorization'] = 'Bearer' + store.state.user.token
    }
    // if(config.method == 'put' && !authMixin.methods.hasAuth('EDIT_PRODUCT')){
    //   console.log(!authMixin.methods.hasAuth('EDIT_PRODUCT'));
      
    //   alert("没有权限")
    // }
    return config
  }, 
  error => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    
    return Promise.resolve(response)

  },
  error => {

  }
)


export default async ({ url = '', data = {}, method = '' }: requestDataType) => {
  // method = method.toUpperCase()
  url = BASE_URL + url
  let res = null
  if (method === 'GET') {
    // 处理get请求的参数
    let dataStr = ''
    Object.keys(data).forEach(key => {
      dataStr += key + '=' + data[key] + '&'
    })
    if (dataStr.length) {
      url += '?' + dataStr.substring(0, dataStr.length - 1)
    }
    res = await axios.get(url)
  } else if (method === 'POST') {
    res = await axios.post(url, data)
  } else if (method === 'PUT') {
    res = await axios.put(url, data)
  } else if (method === 'DELETE') {
    res = await axios.delete(url, { data }) // axios的delete方法只有url和config两个参数
  } else {
    ElMessage.error('暂不支持该请求类型')
    return
  }
  const resData: responseDataType = res.data
  if (resData.code === 0) {
    if (resData.msg) {
      ElMessage.success(resData.msg)
    }
  } else {
    if (resData.msg) {
      ElMessage.error(resData.msg)
    }
  }
  return resData
}
