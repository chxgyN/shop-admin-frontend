<template>
  <div class="order-detail-container">
    <el-button
      round
      plain
      icon="el-icon-arrow-left"
      size="small"
      @click="$router.go(-1)"
    >
      返回
    </el-button>
    <div
      class="purchase-status-timeline-wrapper"
      style="justify-content: space-between;"
    >
      <!-- 订单状态时间线 -->
      <el-card
        class="purchase-status-timeline-container"
        style="margin: 30px 0;width: 70%;"
      >
        <template #header>
          <div style="text-align: center;">
            订单状态
          </div>
        </template>
        <!-- 遍历状态常量 -->
        <div
          v-for="orderStatus in Object.keys(PURCHASE_ORDER_STATUS)"
          :key="orderStatus"
          class="purchaseStatus-timeline__item"
          :class="{'purchaseStatus-timeline__item--line-through': isTimeLineFinished(orderStatus)}"
        >
          <div
            class="purchaseStatus-timeline__item__dot"
            :style="{backgroundColor: hasDone(orderStatus) ? '#67C23A' : '#ccc'}"
          />
          <div>
            {{ orderStatus }}
          </div>
        </div>
      </el-card>
      <el-button
        class="order-detail__next-action-btn"
        type="success"
        round
        style="width: 25%;"
        :disabled="!canChangePurchaseStatus"
        @click="changePurchaseStatus"
      >
        {{ nextActionName }}
      </el-button>
    </div>
    <!-- ok 订单详情 -->
    <el-card
      class="order-detail-wrapper"
      style="width: 100%;"
    >
      <template #header>
        <div style="text-align: center;">
          订单详情
        </div>
      </template>
      <el-descriptions
        direction="horizontal"
        :column="2"
        border
      >
      <!-- :label="detailData[key].label"绑定名称 -->
        <el-descriptions-item
          v-for="key in Object.keys(detailData)"
          :key="key"
          :label="detailData[key].label"
        >
          <!-- 如果key是采购商品 -->
          <div v-if="key === 'items'">
            <div
              v-for="(item, idx) in detailData[key].value"
              :key="item.productName"
              class="order-detail__item__product-wrapper"
              style="margin-bottom: 5px;"
            >
              <el-tooltip
                class="item"
                effect="dark"
                :content="item.productName"
                placement="bottom"
              >
                <div
                  class="order-detail__item__product-name"
                  @click="$router.push({path: '/productDetail/' + item._id})"
                >
                  {{ (idx + 1) + '. ' + item.productName }}
                </div>
              </el-tooltip>
              <el-tag size="small">
                {{ item.purchaseQuantity }}
              </el-tag>
            </div>
          </div>
          <!-- 如果key是采购状态 根据状态找到对应的tag标签-->
          <el-tag
            v-else-if="key === 'purchaseStatus'"
            :type="PURCHASE_ORDER_STATUS[detailData[key].value].tagType"
          >
            {{ detailData[key].value }}
          </el-tag>
          <!-- 如果key是普通数据 -->
          <span v-else>
            {{ detailData[key].value }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { PURCHASE_ORDER_STATUS } from '@/constants/constants'
import isOperator from '@/hook/isOperator'
import isPermissions from '@/hook/isPermissions'

export default defineComponent({
  name: 'OrderDetail',
  setup () {
    // 采购具体信息detailData
    const detailData = ref([])
    // 采购状态
    const purchaseStatus = ref(null)
    return {
      PURCHASE_ORDER_STATUS,
      detailData,
      purchaseStatus
    }
  },
  computed: {
    // 根据下一次采购状态和权限决定是否禁用按钮
    canChangePurchaseStatus () {
      if (this.nextActionName === '未开始') {
        return true
      } else if (this.nextActionName === '采购完成') {
        return isPermissions('PURCHASE_ALL') || isOperator(this.detailData.purchaserAccount.value)
      } else if (this.nextActionName === '入库完成') {
        return isPermissions('STORAGE')
      } else if (this.nextActionName === '订单已完成') {
        return false
      }
      return false
    },

    // 通过purchaseStatus属性获取下一次的采购状态
    nextActionName () {      
      if (!this.purchaseStatus) {
        return '未开始'
      }
      // 一共四种采购状态 这里输出4
      const total = Object.keys(PURCHASE_ORDER_STATUS).length

      // 从未完成到订单完成分别是1、2、3、4 如果purchaseStatus是3、4都输出这个
      if (PURCHASE_ORDER_STATUS[this.purchaseStatus].index === total 
       || PURCHASE_ORDER_STATUS[this.purchaseStatus].index === (total - 1)) {
        return '订单已完成'
      } 
      else {
        const idx = PURCHASE_ORDER_STATUS[this.purchaseStatus].index + 1
      // 2 采购完成 和 3 入库完成
        // console.log(idx);
        // console.log(Object.keys(PURCHASE_ORDER_STATUS).find((item: any) => {
        //   return PURCHASE_ORDER_STATUS[item].index === idx
        // }));
        
        return Object.keys(PURCHASE_ORDER_STATUS).find((item: any) => {
          return PURCHASE_ORDER_STATUS[item].index === idx
        })
      }
    }
  },
  async created () {
    await this.getOrderDetail()
  },
  methods: {

    // 根据当前params获取采购信息 采购状态
    async getOrderDetail () {
      const res = await this.$api.getPurchaseOrder({
        orderId: this.$route.params.orderId
      })
      this.detailData = res.data
      this.purchaseStatus = this.detailData.purchaseStatus.value   
    },

    // 根据下一次采购状态进行状态更新
    async changePurchaseStatus () {
      if (this.nextActionName === '采购完成') {
        await this.$api.changePurchaseOrderStatus({
          orderId: this.$route.params.orderId,
          purchaseStatus: '采购完成'
        })
      } 
      else if (this.nextActionName === '入库完成') {
        await this.$api.changePurchaseOrderStatus({
          orderId: this.$route.params.orderId,
          purchaseStatus: '入库完成',
          endTime: Date.now(),
          operatorAccount: this.$store.state.user.account
        })
      }
      await this.getOrderDetail()
    },


    hasDone (status: string) {
      if (!this.purchaseStatus) {
        return false
      }
      if (PURCHASE_ORDER_STATUS[status].index <= PURCHASE_ORDER_STATUS[this.purchaseStatus].index) {
        return true
      }
      return false
    },

    isTimeLineFinished (status: string) {
      if (!this.purchaseStatus) {
        return false
      }
      if (PURCHASE_ORDER_STATUS[status].index < PURCHASE_ORDER_STATUS[this.purchaseStatus].index) {
        return true
      }
      return false
    }
  }
})
</script>

<style lang="scss" scoped>
.purchase-status-timeline-container {
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
  }
}
:deep(.order-detail__next-action-btn.el-button.is-round) {
  padding-top: 20px;
  padding-bottom: 20px;
  border-radius: 30px;
}
.purchaseStatus-timeline__item, .order-detail__item__product-wrapper, .purchase-status-timeline-wrapper {
  display: flex;
  align-items: center;
}
.purchaseStatus-timeline__item {
  // 从上至下垂直排列子元素
  flex-direction: column;
  position: relative;
  height: 55px;
  justify-content: space-between;
  // 大小自适应计算
  flex: 1;
  &.purchaseStatus-timeline__item--line-through {
    &::after {
      background-color: #67C23A;
    }
  }
  &::after {
    display: block;
    content: '';
    height: 4px;
    width: calc(100% - 40px);
    background-color: #ddd;
    position: absolute;
    left: calc(50% + 20px);
    top: 8px;
    transform: translateY(-50%);
  }
  &:last-of-type {
    &::after {
      display: none;
    }
  }
}
.purchaseStatus-timeline__item__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.order-detail__item__product-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 40vw;
  margin-right: 10px;
  display: inline-block;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
