<template>
  <div class="table-display-container">
    <el-table
      v-loading="loading"
      :data="products"
      empty-text="暂无"
      border
      @selection-change="handleSelectionChange"
    >
    <!-- 
      当el-table元素中注入data对象数组后，
      在el-table-column中用prop属性来对应对象中的键名即可填入数据，
      用label属性来定义表格的列名。可以使用width属性来定义列宽。 
    -->
      <el-table-column
        type="selection"
        width="40"
      />
      <!-- fixed代表固定列 -->
      <el-table-column
        label="商品名"
        :fixed="true"
      >
        <template #default="scope">
          <router-link :to="{path: '/productDetail/' + scope.row._id}">
            {{ scope.row.productName }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        v-for="column in columns"
        :key="column.key"
        :prop="column.key"
        :label="column.label"
        :width="column.width"
        :fixed="column.fixed"
        show-overflow-tooltip
      />
      <el-table-column
        label="状态"
        width="60"
      >
        <template #default="scope">
          <el-tag
            size="mini"
            :type="scope.row.status === '售罄' ? 'danger' : 'success'"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            size="small"
            :disabled="!isPermissions('EDIT_PRODUCT')"
            @click="$emit('editProduct', scope.row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除此商品吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="deleteProduct(scope.row)"
          >
            <template #reference>
              <el-button
                size="small"
                type="danger"
                :disabled="!isPermissions('EDIT_PRODUCT')"
              >
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="products.length || loading"
      style="margin-top: 20px;"
      background
      layout="prev, pager, next"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :current-page="pagination.pageIdx"
      @current-change="getProducts($event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import columns from './tableColumns'
import isPermissions from '@/hook/isPermissions'
import { getAllProducts} from '@/api/api'
import { debounce } from 'lodash'

export default defineComponent({
  name: 'TableDisplay',
  props: {
    allFilters: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    allFilters: {
      async handler () {
        await this.getProducts()
      },
      immediate: true
    }
  },
  setup (props) {
    const products :any = ref([])
    const selectedRows = ref([])
    const loading = ref<boolean>(false)
    const pagination = {
      total: 0,
      pageIdx: 1,
      pageSize: 6
    }
    
    const getProducts = debounce(async function (pageIdx = 1) {  
      const filters = Object.keys(props.allFilters).reduce((res: any, key: string) => {
        if (key !== 'refresh' && props.allFilters[key]) {
          res[key] = props.allFilters[key]
        }
        return res  
      }, {})   
      pagination.pageIdx = pageIdx
      loading.value = true
      const res :any= await getAllProducts({
        ...filters,
        ...pagination
      })
      loading.value = false
      products.value = res.data
      pagination.total = res.total
    }, 200)

    return {
      columns,
      products,
      selectedRows,
      loading,
      pagination,
      isPermissions,
      getProducts
    }
  },
  methods: {
    async deleteProduct (row: any) {
      await this.$api.deleteProduct({
        _id: row._id,
        productName: row.productName
      })
      await this.getProducts()
    },
    handleSelectionChange (selectedRows: any) {
      this.selectedRows = selectedRows
    },
    async deleteSelectedProducts () {
      const checkedList = this.selectedRows.map(item => ({
        _id: item._id,
        productName: item.productName
      }))
      this.$api.deleteProducts({
        checkedList
      })
      await this.getProducts()
    }
  }
})
</script>

<style>
</style>
