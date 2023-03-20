import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { getUserFromLocal } from '@/utils'
import Store from '@/store'
import { socket } from '@/main'

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
  {
    path: '/userManagement',
    name: 'userManagement',
    component: () => import('@/views/UserManagement/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  if (to.name === 'login') {
    next()
  } else {
    if (!Store.state.user.account) {
      await getUserFromLocal()
      if (Store.state.user.account) {
        // 用户登录后发送用户信息
        if (!Store.state.socketConnected) {
          socket.emit('userLogin', Store.state.user.account)
          Store.state.socketConnected = true
        }
        next()
      } else {
        next({ path: '/login' })
      }
    } else {
      next()
    }
  }
})

export default router
