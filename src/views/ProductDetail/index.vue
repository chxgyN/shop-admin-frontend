<template>
  <div class="product-detail">
    <el-button
      round
      plain
      icon="el-icon-arrow-left"
      size="small"
      @click="$router.go(-1)"
    >
      返回
    </el-button>

    <ProductCard
    :show-hover-actions="false"
    style="margin-top: 10px;"
    :product="product"
    />

    <el-table
      v-loading="tableLoading"
      style="margin-top: 20px;"
      :data="productInventoryChangeTableData"
      border
    >
      <el-table-column
        v-for="column in inventoryChangeTableColumns"
        :key="column.key"
        :width="column.width"
        :fixed="column.fixed"
        :label="column.label"
        :prop="column.key"
        show-overflow-tooltip
      />
      <el-table-column
        label="类型"
        width="100"
      >
        <template #default="scope">
          <el-tag :type="(scope.row.type === '购入') ? 'success' : 'warning'">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ProductCard from '@/components/productsDisplay/ProductCard.vue'
import inventoryChangeTableColumns from './inventoryChangeTableColumns'
import { useRouter } from 'vue-router';
import {getProduct, getProductInventoryChange} from "@/api/api"

export default defineComponent({
  name: 'ProductDetail',
  components: {
    ProductCard
  },
  setup () {
    const router = useRouter()    
    const product = ref({})
    const tableLoading = ref<boolean>(false)
    const productInventoryChangeTableData: any = ref([])
    
    async function getInfo() {     
      let res = await getProduct({ _id: router.currentRoute.value.params._id })
      product.value = res.data
      tableLoading.value = true
      res = await getProductInventoryChange({ _id: router.currentRoute.value.params._id })
      productInventoryChangeTableData.value = res.data
      tableLoading.value = false
    }

    getInfo()

    return {
      product,
      tableLoading,
      inventoryChangeTableColumns,
      productInventoryChangeTableData,
      getInfo
    }
  },

})
</script>

<style lang="scss" scoped>
.product-detail {
  :deep(.product-card-title) h3 {
    width: 70% !important;
  }
  :deep(.product-card-content__img) {
    width: 220px !important;
  }
}
</style>
