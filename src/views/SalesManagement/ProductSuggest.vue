<template>
  <div
    v-loading="loading"
    class="product-suggest-container"
  >
    <el-menu
      default-active="salesVolumn"
      mode="horizontal"
      @select="typeShow = $event"
    >
      <el-menu-item index="salesVolumn">
        月销量排行榜
      </el-menu-item>
      <el-menu-item index="totalAmount">
        月总销售额排行榜
      </el-menu-item>
      <el-menu-item index="totalProfit">
        月总利润排行榜
      </el-menu-item>
    </el-menu>
    <ProductRank
      v-if="typeShow === 'salesVolumn'"
      :list="salesVolumnRankList" 
    />
    <ProductRank
      v-if="typeShow === 'totalAmount'"
      :list="totalAmountRankList" 
    />
    <ProductRank
      v-if="typeShow === 'totalProfit'"
      :list="totalProfitRankList"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, defineProps } from 'vue'
import ProductRank from '@/components/ProductSuggest/ProductRank.vue'

export default defineComponent({
  name: 'ProductSuggest',
  components: {
    ProductRank
  },
  setup () {
    // const props = defineProps(['title'])
    const loading = ref(false)
    const list = ref([])
    const type = ref< 'month' | 'year'>('month')
    const typeShow = ref('salesVolumn')
    return {
      loading,
      list,
      typeShow,
      type
    }
  },
  computed: {
    salesVolumnRankList () {
      //copy array
      const list = this.list.slice()
      // 降序
      list.sort((a, b) => (b.num - a.num))
      return list
    },
    totalAmountRankList () {
      const list = this.list.slice()
      list.sort((a, b) => (b.amount - a.amount))
      return list
    },
    totalProfitRankList () {
      const list = this.list.slice()
      list.sort((a, b) => (b.profit - a.profit))
      return list
    }
  },
  async created () {
    this.loading = true
    const res = await this.$api.productSuggest()
    const resProfit = await this.$api.getSalesReport({type: 'month'})
    const data = res.data
    const prof = resProfit.data
    //添加利润信息
    for(let i = 0; i < data.length; i++){
      for(let j = 0; j < prof.length; j++){
        if(data[i]._id == prof[j]._id) {
          data[i].profit = prof[j].profit
          break
        }
      }
    }
    this.list = data
    this.loading = false

    
  }
})
</script>

<style lang="scss" scoped>
:deep(.el-menu) {
  display: flex;
  justify-content: space-evenly;
}
</style>
