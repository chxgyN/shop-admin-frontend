<template>
  <div style="padding: 5px 10px">
    <div class="actions-container"
         style="margin-bottom: 20px;">
      <el-button
        size="small"
        :disabled="!isPermissions('SELL_SELF')"
        @click="showAddingDrawer"
      >
        添加销售记录
      </el-button>
    </div>
    <div :style="{ height: computedBoxHeight }">
      <el-table :height=48 :data="[]">
        <el-table-column
          v-for="column in tableColumns"
          :key="column.key"
          :width="column.width"
          :fixed="column.fixed"
          :label="column.label"
          :prop="column.key"
          show-overflow-tooltip
        >
        </el-table-column>
      </el-table>
      <div ref='scrollContainer' class="scrollContainer" @scroll.passive="handleScroll">
        <div :style="blankFillStyle">
          <el-table
          class="content-table"
          v-loading="loading"
          :data="showDataList"
          :span-method="spanMethod"
          border
          >
            <el-table-column
              v-for="column in tableColumns"
              :key="column.key"
              :width="column.width"
              :fixed="column.fixed"
              :label="column.label"
              :prop="column.key"
              show-overflow-tooltip
            />
            <el-table-column
              label="操作"
              width="100"
              fixed="right"
            >
              <template #default="scope">
                <el-popconfirm
                  title="确定删除此销售记录吗？"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  @confirm="deleteSalesOrder(scope.row)"
                >
                  <template #reference>
                    <el-button
                      size="small"
                      type="danger"
                      :disabled="!(isPermissions('SELL_SELF') || isOperator(scope.row.sellerAccount))"
                    >
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>  
      </div>
    </div>
    <!-- 添加销售记录 - 抽屉 -->
    <el-drawer
      v-model="showDrawer"
      destroy-on-close
      size="70%"
      title="添加销售记录"
    >
      <el-form
        ref="AddOrderForm"
        :model="addOrderForm"
        style="padding: 20px;"
        label-position="left"
      >
        <el-row
          v-for="(item, index) in addOrderForm.items"
          :key="item.index"
        >
          <el-col :span="8">
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
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="商品数量"
              :prop="'items.' + index + '.salesVolume'"
              :rules="salesVolumeRule"
            >
              <el-input-number
                v-model="item.salesVolume"
                size="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
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
import { defineComponent, ref } from 'vue'
import tableColumns from './tableColumns'
import isPermissions from '@/hook/isPermissions'
import isOperator from '@/hook/isOperator'
export default defineComponent({
  name: 'SalesRecords',
  mounted(){
    console.time("render时间：");
    this.$nextTick(() => {
      console.timeEnd("render时间：");
    });
    this.getContainSize()
  },
  computed:{
    computedBoxHeight () {
        const emptyH = 60 // el-table空盒子默认高60
        const tableHeadH = 48 // 表头高度默认48
        // 兼容空项动态高度
        return this.ordersData.length > 0 ? (570 + 48 +'px') : emptyH + tableHeadH + 'px'
    },

    endIndex() {
      if(this.ordersData.length){
        // 解决无限滚动
        if(!this.ordersData[this.startIndex + this.containSize]){
          return this.ordersData.length - 1
        }        
        return this.startIndex + this.containSize
      }
    },
    showDataList() {      
      if(this.ordersData.length) {
        return this.ordersData.slice(this.startIndex, this.endIndex) 
      }
    },
    blankFillStyle(){     
      return {
        paddingTop: this.startIndex * this.itemHeight + 'px',      
        paddingBottom: (this.ordersData.length - this.endIndex - 1) * this.itemHeight + 'px'
      }
    }
  },
  setup () {
    const isScrollStatus = ref(true)
    const startOffset = ref(0)
    const startIndex = ref(0)
    const itemHeight = ref(57)// item高度
    const containSize = ref(0) // 展示的数据
    const orders = ref([])
    const ordersData = ref([])
    const showDrawer = ref<boolean>(false)
    const addOrderForm = ref({
      remark: '',
      items: [{
        productName: '',
        salesVolume: 1,
        inventory: 0,
        key: Date.now()
      }]
    })
    const allProductsOptions = ref([])
    // 销售添加 - 商品名规则
    const productNameRule = {
      validator: (rule: any, value: any, cb: any) => {
        if (!value) {
          cb(new Error('商品名不能为空'))
        } else {
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
    // 销售添加 - 商品数量规则
    const salesVolumeRule = {
      validator: (rule: any, value: any, cb: any) => {
        const idx = rule.field.split('.')[1]
        const item = addOrderForm.value.items[idx]
        if (value < 1) {
          cb(new Error('数量不能小于1'))
        } else if (value > item.inventory) {
          cb(new Error('数量不能超过库存量'))
        } else {
          cb()
        }
      },
      trigger: 'change'
    }
    const loading = ref<boolean>(false)
    return {
      tableColumns,
      orders,
      ordersData,
      showDrawer,
      addOrderForm,
      allProductsOptions,
      productNameRule,
      salesVolumeRule,
      loading,
      isOperator,
      isPermissions,
      startIndex,
      itemHeight,
      containSize,
      startOffset,
      isScrollStatus
    }
  },
  async created () {
    await this.getOrders()
  },
  methods: {
    // 没有padding 列表下拉 顶部dom元素强制删除 startIndex会重新计算
    handleScroll(){
      // let requestAnimationFrame = window.requestAnimationFrame 
      // let fps = 30 ;
      // let interval = 1000/fps ;
      // let then = Date.now();
      // requestAnimationFrame(()=>{
      //   let now = Date.now();
      //   const start = Math.floor(this.scrollTop / this.itemHeight);
      //   if (start !== this.startIndex ){

        if(this.isScrollStatus){
          this.isScrollStatus = false
          let timer = setTimeout(() => {
            this.isScrollStatus = true
            clearTimeout(timer)
          }, 0);
          setTimeout(() => {
            this.startIndex = ~~((this.$refs.scrollContainer.scrollTop) / this.itemHeight);
            console.log(this.startIndex , this.endIndex);
            console.log(this.blankFillStyle.paddingTop, this.blankFillStyle.paddingBottom);
          }, 0);
        }
        
      //   }
      //   if(now-then >= interval){
      //     then = now;
      //     // requestAnimationFrame( arguments.callee );
      //     requestAnimationFrame((timestamp) => {
      //       this.handleScroll();
      //     });
      //   }
      // })
    },
    
    getContainSize () {
      // 11      
      this.containSize = this.$refs.scrollContainer.offsetHeight / this.itemHeight + 1      
    },
    // 获取销售商品
    async getOrders () {
      this.loading = true
      const res = await this.$api.getAllSalesOrders()
      this.orders = res.data
      // res是原数组 prev是初始值或者前一次计算后的结果 cur是正在被处理元素
      this.ordersData= res.data.reduce((prev: Array<any>, cur: any) => {
        // concat用于连接两个数组生成新数组
        return prev.concat(cur.orders)
      }, [])
      this.loading = false
    },
    // 添加销售订单后，清除表单、关闭添加抽屉、重新获取订单数据
    handleAddOrder () {
      this.$refs.AddOrderForm.validate(async (valid: boolean) => {
        // valid表单内容全部合法，则valid值为true，执行对应的业务逻辑  
        if (valid) {
          let res = null
          const time = Date.now()
          res = await this.$api.addSalesOrder({
            orderId: time,
            remark: this.addOrderForm.remark,
            items: this.addOrderForm.items,
            sellerAccount: this.$store.state.user.account,
            createTime: time
          })
          if (res.code === 0) {
            this.$refs.AddOrderForm.resetFields()
            this.showDrawer = false
            await this.getOrders()
          }
        } 
        else {
          return this.$message.error("请填写必要的表单项！")
       }
      })
    },
    // 删除销售订单
    async deleteSalesOrder (row: any) {
      this.loading = true
      await this.$api.deleteSalesOrder({
        orderId: row.orderId
      })
      await this.getOrders()
      this.loading = false
    },
    // 展示添加采购 并且获取下拉列表的所有商品数据
    async showAddingDrawer () {
      this.showDrawer = true
      await this.getAllProductNames()
    },
    async getAllProductNames () {
      let filters = { inventory: true }
      const res = await this.$api.getAllProductNames(filters)
      // map方法对原数组每一个元素操作，组成一个新的数组，包含商品名
      this.allProductsOptions = res.data.map((item: any) => ({
        label: item.productName,
        value: item.productName
      }))
    },
    // 添加商品时选中，获取当前商品的库存信息和库存上线信息并添加到item中
    // 最后选中的是要通过 确定提交 到后端
    async getProduct (item) {
      const res = await this.$api.getProduct({ productName: escape(item.productName) })
      item.inventory = res.data.inventory
      item.inventoryCeiling = res.data.inventoryCeiling
      // console.log(item);
    },
    // 添加抽屉同时添加多个商品与删除
    addRowItem () {
      this.addOrderForm.items.push({
        productName: '',
        inventory: 0,
        salesVolume: 100,
        key: Date.now()
      })
    },
    deleteRowItem (rowItem: any) {
      const items = this.addOrderForm.items
      const idx: number = items.findIndex(item => item.key === rowItem.key)
      items.splice(idx, 1)
    },
    // 合并行和列
    spanMethod ({ rowIndex, columnIndex }) {
      // 设置需要合并的列 0、3、4、5列
      if ((columnIndex !== 1) && (columnIndex !== 2)) {
        let idx = 0
        // 从开始的行开始判断，每一行都判断再渲染  
        // 包裹的for方法用于读取count属性
        for (const item of this.orders) { 
          if (rowIndex === idx) {
            return {
              // 合并行数与列数
              rowspan: item.count,
              colspan: 1
            }
          } 
          else if (idx > rowIndex) {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
          idx += item.count
        }
        return {
          rowspan: 0,
          colspan: 0
        }
      } 
      else {
        return {
          rowspan: 1,
          colspan: 1
        }
      }
    },
   
  }
})
</script>

<style lang="scss" scoped>
// .head-table {
//   float: left;
//   ::v-deep .el-table__body-wrapper { // 隐藏表头warpper
//     display: node;
//   }
// }
.scrollContainer{
  height: 570px;
  width: 100%;
  overflow-y: auto;
  // ::v-deep .el-table__row >td {
  //     border: none;
  // }
  .content-table {
      ::v-deep .el-table__header {
          display: none;
      }
  }
}
:deep(.el-drawer.rtl) {
  overflow: scroll !important;
}
:deep(.el-col) {
  display: flex;
  align-items:center;
}
</style>