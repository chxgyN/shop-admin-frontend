<template>
  <div style="padding: 10px 20px;">
    <div class="actions-container">
      <el-button
        size="small"
        :disabled="!isPermissions('PURCHASE_SELF')"
        @click="showAddingDrawer"
      >
        添加采购订单
      </el-button>
    </div>
    <!-- 订单表 
      ordersData -> 对象数组-->
    <el-table
      v-loading="loading"
      style="margin-top: 20px;"
      :data="ordersData"
      border
    >
    <!-- scope数据哪里来的？ -->
      <el-table-column
        label="订单ID"
        width="130"
        fixed="left"
      >
      <!-- scope.row里面的东西，和ordersData一样 
          应该是先从el-table先传入 el-table-column内部，再从其中读取
      -->
        <template #default="scope">
          <span
            class="order-table-item__orderId"
            @click="$router.push({
              name: 'purchaseOrderDetail',
              params:{
                orderId: scope.row.orderId
              } 
            })"
          >
            {{ scope.row.orderId }}
          </span>
        </template>
      </el-table-column>
      <!-- label代表列名  -->
      <!-- 通过key来获取对应ordersData中的数据 -->
      <el-table-column
        v-for="column in tableColumns"
        :width="column.width"
        :label="column.label"
        :prop="column.key"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        label="采购状态"
        width="100"
      >
        <template #default="scope">
          <el-tag :type="PURCHASE_ORDER_STATUS[scope.row.purchaseStatus].tagType">
            {{ scope.row.purchaseStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 使用了作用域插槽（slot）来自定义列中的内容 -->
      <el-table-column
        label="操作"
        width="100"
        fixed="right"
      >
        <template #default="scope">
          <el-popconfirm
            title="确定删除此采购订单吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="deletePurchaseOrder(scope.row)"
          >
            <template #reference>
              <el-button
                size="small"
                type="danger"
                :disabled="!(isPermissions('PURCHASE_SELF') || isOperator(scope.row.purchaserAccount))"
              >   
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      v-if="ordersData?.length || loading"
      style="margin-top: 20px;"
      background
      layout="prev, pager, next"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :current-page="pagination.pageIdx"
      @current-change="pageChange($event)"
    />
    <!-- 添加采购订单 - 抽屉 -->
    <el-drawer
      v-model="showDrawer"
      destroy-on-close
      size="70%"
      title="添加采购订单"
    >
      <el-form
        ref="AddOrderForm"
        :model="addOrderForm"
        style="padding: 20px;"
        label-position = "left"
      >
        <el-form-item
          label="订单名"
          prop="name"
          :rules="{ required: true, message: '订单名不能为空', trigger: 'blur' }"
        >
          <el-input
            v-model="addOrderForm.name"
            size="small"
          />
        </el-form-item>
        <el-row
          v-for="(item, index) in addOrderForm.items"
          :key="item.index"
        >
          <el-col :span="7">
            <el-form-item
              label="商品名"
              :prop="'items.' + index + '.productName'"
              :rules="productNameRule"
            >
              <el-select
                v-model="item.productName"
                size="small"
                filterable
                placeholder="请选择商品"
                @change="getProduct(item)"
              >
                <el-option
                  v-for="product in allProductsOptions"
                  :key="product.value"
                  :label="product.label"
                  :value="product.value"
                  size="small"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item
              label="商品数量"
              style="margin-left: 10px;"
              :prop="'items.' + index + '.purchaseQuantity'"
              :rules="purchaseQuantityRule"
            >
              <el-input-number
                v-model="item.purchaseQuantity"
                size="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item
              label="库存量"
              size="small"
              :prop="'items.' + index + '.inventory'"
            >
              <el-tag size="medium">
                {{ item.inventory || 0 }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item
              label="库存上限"
              size="small"
              :prop="'items.' + index + '.inventoryCeiling'"
            >
              <el-tag size="medium">
                {{ item.inventoryCeiling || 0 }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button
              icon="el-icon-plus"
              circle
              @click="addRowItem"
            />
            <el-button
              :disabled="index === 0"
              type="danger"
              icon="el-icon-delete"
              circle
              @click="deleteRowItem(item)"
            />
          </el-col>
        </el-row>
        <el-form-item
          label="存货地点"
          prop="inventoryLocation"
        >
          <el-select
            v-model="addOrderForm.inventoryLocation"
            size="small"
            filterable
            placeholder="请选择存货地点"
          >
            <el-option
              v-for="location in INVENTORY_LOCATION_OPTIONS"
              :key="location.value"
              :label="location.label"
              :value="location.value"
              size="small"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input v-model="addOrderForm.remark" />
        </el-form-item>
        <div
          class="drawer-footer"
          style="display: flex;justify-content: space-evenly;align-items: center;width: 50%;margin: 20px auto;"
        >
          <el-button @click="showDrawer = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleAddOrder"
          >
            确定
          </el-button>
        </div>
      </el-form>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import tableColumns from './tableColumns'
import { PURCHASE_ORDER_STATUS, INVENTORY_LOCATION_OPTIONS } from '@/constants/constants'
import isPermissions from '@/hook/isPermissions'
import isOperator from '@/hook/isOperator'
import { getAllPurchaseOrders } from '@/api/api'


export default defineComponent({
  name: 'PurchaseManagement',
  setup () {

    const showDrawer = ref<boolean>(false)
    const addOrderForm = ref({
      name: '',
      remark: '',
      inventoryLocation: '默认仓库',
      items: [{
        productName: '',
        purchaseQuantity: 100,
        inventory: 0,
        inventoryCeiling: 0,
        key: Date.now()
      }]
    })
    const loading = ref<boolean>(false)
    const allProductsOptions = ref([])

    // 采购添加 - 商品名规则
    const productNameRule = {
      validator: (rule: any, value: any, cb: any) => {
        if (!value) {
          cb(new Error('商品名不能为空'))
        } 
        else {
          const sameNameItems = addOrderForm.value.items.filter(item => {
            return item.productName === value
          })
          if (sameNameItems.length > 1) {
            cb(new Error('商品名不能重复'))
          } else {
            cb()
          }
        }
      },
      trigger: 'change'
    }

    // 采购添加 - 商品数量规则
    // const strategies = {
    //   lessThanOne: function(){

    //   },
    // }
    const purchaseQuantityRule = {
      validator: (rule: any, value: any, cb: any) => {
        const idx = rule.field.split('.')[1]
        const item = addOrderForm.value.items[idx]
        if (value < 1) {
          cb(new Error('数量不能小于1'))
        } 
        else if (value > item.inventoryCeiling - item.inventory) {
          cb(new Error('数量不能超过库存上限'))
        } 
        else {
          cb()
        }
      },
      trigger: 'change'
    }

    ////获取元素和翻页获取元素
    const pagination:any= ref({
      total: 0,
      pageIdx: 1,
      pageSize: 8
    })
    const ordersData = ref([])
    //发生页数变化动作时，调用这个函数更新页数信息，监视属性监视到变化，带着页数信息，请求进货信息
    function pageChange(pageIdx) {
      pagination.value.pageIdx = pageIdx
    }
    // 封装函数是通过return获取值，而直接在setup中的函数可以修改上下文中的值 
    // 必须使用pagination.value 而不是pagination 不然获取不到值
    watch(pagination.value, async() => {   
        await getOrders()
    },{immediate: true})
    async function getOrders() {
      loading.value = true    
      let res = null
      res = await getAllPurchaseOrders({ ...pagination.value })
      // res.data是一个对象数组 order是具体信息数组 获取当前元素信息在【0】中
      // res上一次回调返回值 cur是被处理元素
      ordersData.value = res.data.reduce((res: Array<any>, cur: any) => {       
        res.push(cur.orders[0])       
        return res
      }, [])
      pagination.value.total = res.total
      loading.value = false
    }

    return {
      tableColumns,
      ordersData,
      showDrawer,
      addOrderForm,
      allProductsOptions,
      productNameRule,
      purchaseQuantityRule,
      loading,
      PURCHASE_ORDER_STATUS,
      INVENTORY_LOCATION_OPTIONS,
      pagination,
      isPermissions,
      isOperator,
      pageChange,
      getOrders
    }
  },
  methods: {

    // 展示添加采购 并且获取下拉列表的所有商品数据
    async showAddingDrawer () {
      this.showDrawer = true
      await this.getAllProductNames()
    },
    async getAllProductNames () {
      let filters = {}      
      if (this.$options.name === 'SalesRecords') {
        filters = {
          inventory: true
        }
      }
      const res = await this.$api.getAllProductNames(filters)
      // map方法对原数组每一个元素操作，组成一个新的数组
      this.allProductsOptions = res.data.map((item: any) => ({
        label: item.productName,
        value: item.productName
      }))   
    },

    // 添加商品时选中，获取当前商品的库存信息和库存上线信息
    async getProduct (item) {
      const res = await this.$api.getProduct({ productName: escape(item.productName) })
      item.inventory = res.data.inventory
      item.inventoryCeiling = res.data.inventoryCeiling
    },

    // 添加采购订单后，清除表单、关闭添加抽屉、重新获取订单数据
    handleAddOrder() {
      this.$refs.AddOrderForm.validate(async (valid: boolean) => {    
        // valid表单内容全部合法，则valid值为true，执行对应的业务逻辑    
        if (valid) {
          let res = null
          const time = Date.now()  
          // 数据在填写的时候就通过v-model开始绑定        
          res = await this.$api.addPurchaseOrder({
            orderId: time,
            name: this.addOrderForm.name,
            inventoryLocation: this.addOrderForm.inventoryLocation,
            remark: this.addOrderForm.remark,
            items: this.addOrderForm.items,
            purchaserAccount: this.$store.state.user.account,
            createTime: time
          })         
          if (res.code === 0) {
            this.$refs.AddOrderForm.resetFields()
            this.showDrawer = false
            await this.getOrders()
          }
        } else {
          return this.$message.error("请填写必要的表单项！")
        }
      })
    },

    // 添加抽屉同时添加多个商品与删除
    addRowItem () {
      this.addOrderForm.items.push({
        productName: '',
        purchaseQuantity: 100,
        inventory: 0,
        inventoryCeiling: 0,
        key: Date.now()
      })
    },
    deleteRowItem (rowItem: any) {
      const items = this.addOrderForm.items
      const idx: number = items.findIndex(item => item.key === rowItem.key)
      items.splice(idx, 1)
    },
    
    // 删除订单
    async deletePurchaseOrder (row) {
      this.loading = true
      await this.$api.deletePurchaseOrder({
        orderId: row.orderId
      })
      await this.getOrders()
      this.loading = false
    },

    // 控制采购状态？？？？没找到对应的触发代码
    async handlePurchaseStatusChange (row: any, e: any) {
      this.loading = true
      await this.$api.changePurchaseOrderStatus({
        ...row,
        purchaseStatus: e,
        endTime: (e === '已完成') ? (Date.now()) : '',
        operatorAccount: this.$store.state.user.account
      })
      await this.getOrders()
      this.loading = false
    }
  }
})
</script>

<style lang="scss" scoped>
:deep(.el-drawer.rtl) {
  overflow: scroll !important;
}
:deep(.el-col) {
  display: flex;
  align-items:center;
}
.order-table-item__orderId {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
