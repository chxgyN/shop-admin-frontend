import store from '@/store'
// 解决编译器无法识别Vue.js的类型问题
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: store
  }
}
