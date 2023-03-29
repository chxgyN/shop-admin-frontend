<template>
  <div>
    <!-- 内容 -->
    <div
      v-if="products.length"
      class="cards-display-container"
    >
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
import { defineComponent, ref, watch, Ref} from 'vue'
import ProductCard from './ProductCard.vue'
import getProducts from '@/hook/getProducts'
// import { getProdectResType } from '@/api/types/product'

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
  emits: ['editProduct'],
  setup (props) {
    const total = ref(0)
    const products: any = ref([])
    const pageIdx = ref(1)
    const pageSize = ref(6)

    async function loadProducts() {
      const result = await getProducts()
      products.value = result.products
      total.value = result.total
      pageIdx.value = result.pageIdx
      pageSize.value = result.pageSize
    }

    async function handlePageChange(newPageIdx) {
      const result = await getProducts(newPageIdx)
      products.value = result.products
      total.value = result.total
      pageIdx.value = result.pageIdx
      pageSize.value = result.pageSize
    }

    loadProducts()

    return {
      allFilters: props.allFilters,
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
