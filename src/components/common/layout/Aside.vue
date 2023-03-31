<template>
  <el-menu
    :router="true"
    :default-openeds="[asideItems['销售管理'].index]"
    :default-active="$route.path"
    background-color="#ffffff"
  > 
  <!-- :default-active="asideItems['库存管理'].index" -->
  <!-- Object.values对象值构成的数组 -->
  <!-- asideItems {...}
    销售管理: {
    name: '销售管理',
    index: '/salesRecords',
    items: [{
      index: '/salesRecords',
      name: '销售记录'
    }, {
      index: '/statisticCharts',
      name: '统计图表'
    }, {
      index: '/productSuggest',
      name: '进货推荐'
    }, {
      index: '/salesReport',
      name: '销售报表'
    }]
  }, 
  -->
    <div
      v-for="submenu in Object.values(asideItems)"
      :key="submenu.name"
    >
    <!-- 有二级路由走这个 -->
      <el-submenu
        v-if="submenu.items"
        :index="submenu.index"
      >
      <!-- 这里相当于父组件的内容,往子组件插 -->
        <template #title>
          {{ submenu.name }}
        </template>
        <el-menu-item
          v-for="item in submenu.items"
          :key="item.name"
          :index="item.index"
        >
          {{ item.name }}
        </el-menu-item>
      </el-submenu>
    <!-- 没有二级路由走这个 -->
      <el-menu-item
        v-else
        :index="submenu.index"
      >
        <template #title>
          {{ submenu.name }}
        </template>
      </el-menu-item>
    </div>
  </el-menu>
</template>

<script lang="ts">
import { defineComponent, ref ,reactive, computed , watch} from 'vue'
import { ASIDE_ITEMS, ROLE_LIST } from '@/constants/constants'
// import authMixin from '@/mixins/authMixin'
import { useStore } from 'vuex'


export default defineComponent({
  name: 'Aside',
  // mixins: [authMixin],
  setup () {
    const asideItems = ref({})
    const as = reactive({})
    const store = useStore()
    // let role = computed(() => {
    //   return store.state.user.role
    // })
    watch(() => store.state.user.role, () => {
      if (hasAuth('USER_MANAGEMENT')) {
          asideItems.value = {
            ...ASIDE_ITEMS,
            用户管理: {
              name: '用户管理',
              index: '/UserManagement'
            }
          }          
        } else {
          asideItems.value = ASIDE_ITEMS
        }
    },{immediate:true})

    function hasAuth (actionAuth: String) {
      if (!store.state.user.role) {
        return false
      }
      return ROLE_LIST[store.state.user.role].auth.includes(actionAuth)
    }

    return {
      // 最好的情况，后端直接返回路由菜单，这里是经过处理的
      // vuex维护login和aside共享数据
      asideItems,
      as,
      // role
    }
  },  

  // watch: {
    // vuex里面的属性
    // role: {
    //   handler () {
    //     if (this.hasAuth('USER_MANAGEMENT')) {
    //       this.asideItems = {
    //         ...ASIDE_ITEMS,
    //         用户管理: {
    //           name: '用户管理',
    //           index: '/UserManagement'
    //         }
    //       }          
    //     } else {
    //       this.asideItems = ASIDE_ITEMS
    //     }
    //   },
    //   immediate: true
    // }
  // }
})
</script>
