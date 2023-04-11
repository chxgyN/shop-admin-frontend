<template>
  <div>
    <!-- 内容 -->
    <div
      v-if="products.length"
      class="cards-display-container"
    >
    <!-- 删除之后通过getProducts自定义事件 重新获取商品数据 -->
    <!-- 触发编辑 -->
      <ProductCard
        v-for="product in products"
        :key="product.productName"
        :product="product"
        @getProducts="loadProducts"
        @editProduct="$emit('editProduct', product)"
      />
    </div>
    <!-- 翻页 -->
    <el-pagination
      v-if="products.length"
      style="margin-top: 20px;"
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="total"
      :current-page="pageIdx"
      @current-change="handlePageChange($event)"
    />
    <el-empty
      v-else
      description="暂无商品信息"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref} from 'vue'
import ProductCard from './ProductCard.vue'
import getProducts from '@/hook/getProducts'

export default defineComponent({
  name: 'CardsDisplay',
  props: {
    allFilters: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    ProductCard
  },
  watch: {
    allFilters: {
      async handler () {
        await this.loadProducts()
      },
      immediate: true
    }
  },
  emits: ['editProduct'],
  setup (props) {
    const total = ref(0)
    const products: any = ref([])
    const pageIdx = ref(1)
    const pageSize = ref(6)
    
    // 一上来先获取一次数据 等到allfilter变化 再调用一次
    async function loadProducts() {
      const result = await getProducts(props.allFilters)
      products.value = result.products
      total.value = result.total
      pageIdx.value = result.pageIdx
      pageSize.value = result.pageSize
    }

    // 翻页获取商品数据
    // 当页码发生变化时，就调用该函数，根据页数去获取对应的商品，感觉不需要pageIdx
    async function handlePageChange(newPageIdx) {
      const result = await getProducts(props.allFilters, newPageIdx)
      products.value = result.products
      total.value = result.total
      pageIdx.value = result.pageIdx
      pageSize.value = result.pageSize
    }

    loadProducts()

    return {
      products,
      total,
      pageIdx,
      pageSize,
      getProducts,
      loadProducts,
      handlePageChange
    }
  }
})
</script>

<style lang="scss" scoped>
.cards-display-container {
  box-sizing: border-box;
  margin-top: 10px;
  display: grid;
  gap: 20px;
}
@media (min-width: 1500px) {
  .cards-display-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (min-width: 1180px) and (max-width: 1500px) {
  .cards-display-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 920px) and (max-width: 1180px) {
  .cards-display-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 920px) {
  .cards-display-container {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
