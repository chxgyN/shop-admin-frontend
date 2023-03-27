import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { getUserFromLocal } from '@/utils'
import Store from '@/store'
import { socket } from '@/main'
import initDynamicRoutes from '@/hook/initDynamicRoutes'

// 路由记录就是一个包含路由规则和组件信息的对象。在创建动态路由时，
// 我们可以使用具有相同格式的多个 RouteRecordRaw 对象来描述路由记录，
// 然后将它们存储在一个routerecordraw对象类型组成的数组，更好的类型检查。
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    redirect: '/inventoryManagement/table'
  },
  // 库存
  {
    path: '/inventoryManagement/:tab',
    name: 'inventoryManagement',
    component: () => import('@/views/InventoryManagement/index.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      noLayout: true
    },
    props: true
  },
  // 采购
  {
    path: '/purchaseManagement',
    name: 'purchaseManagement',
    component: () => import('@/views/PurchaseManagement/index.vue')
  },
  {
    path: '/purchaseManagement/orderDetail/:orderId',
    name: 'purchaseOrderDetail',
    component: () => import('@/views/PurchaseManagement/OrderDetail.vue'),
    props: true
  },
  {
    path: '/productDetail/:_id',
    name: 'productDetail',
    component: () => import('@/views/ProductDetail/index.vue'),
    props: true
  },
  // 销售记录
  {
    path: '/salesRecords',
    name: 'salesRecords',
    component: () => import('@/views/SalesManagement/SalesRecords.vue')
  },
  {
    path: '/statisticCharts',
    name: 'statisticCharts',
    component: () => import('@/views/SalesManagement/StatisticCharts/index.vue')
  },
  {
    path: '/productSuggest',
    name: 'productSuggest',
    component: () => import('@/views/SalesManagement/ProductSuggest.vue')
  },
  {
    path: '/salesReport',
    name: 'salesReport',
    component: () => import('@/views/SalesManagement/SalesReport/index.vue')
  },
  {
    path: '/personalCenter',
    name: 'personalCenter',
    meta: {
      showAside: false
    },
    component: () => import('@/views/PersonalCenter/index.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 前置路由守卫
router.beforeEach(async (to, from, next ) => {
  if (to.name === 'login') {
    next()
  } 
  else {   
    // ' '转化为true ""转化为false
    if (Store.state.user.token === "") {
      await getUserFromLocal()

      // vuex检查后，local中还是没有获取到跳转login，获取到了存放到vuex中跳转发送用户信息
      if (Store.state.user.token === "") {
        next({ path: '/login' })
      } 
      else {
        // 用户登录后发送用户信息 ??
        if (!Store.state.socketConnected) {
          socket.emit('userLogin', Store.state.user.account)
          Store.state.socketConnected = true
        }
        // 地址跳转先于添加路由方法执行完毕
        console.log({...to});
        
        initDynamicRoutes()  
        // router.push({...to, replace:true})
        next({ ...to, replace: true }) // 这里相当于push到一个页面 不在进入路由拦截
      } 
    } 
    else {
      next()
    }
  }
})

// export function initDynamicRoutes() {
//   const role = Store.state.user.role
//   // console.log(router.getRoutes())
//   if(ROLE_LIST[role].auth.includes('USER_MANAGEMENT')){
//     router.addRoute(userMana)
//     // console.log(router.getRoutes())
//   }
// }

export default router
