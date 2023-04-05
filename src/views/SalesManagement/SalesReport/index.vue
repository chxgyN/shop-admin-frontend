<template>
  <div>
    <el-menu
      default-active="month"
      mode="horizontal"
      @select="handleSelect"
    >
      <el-menu-item index="month">
        月
      </el-menu-item>
      <el-menu-item index="year">
        年
      </el-menu-item>
    </el-menu>
    <!-- 报表 -->
    <!-- el-table 元素中注入 data 对象数组后，
      在 el-table-column 中用 prop 属性来对应对象中的键名即可填入数据，
      用 label 属性来定义表格的列名 -->
    <el-table
      v-loading="loading"
      style="margin-top: 20px;"
      :data="salesReportData"
      border
    >
      <el-table-column
        v-for="column in salesReportTableColumns"
        :key="column.key"
        :width="column.width"
        :fixed="column.fixed"
        :label="column.label"
        :prop="column.key"
        show-overflow-tooltip
      />
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import salesReportTableColumns from './salesReportTableColumns'

export default defineComponent({
  name: 'SalesReport',
  setup () {
    const loading = ref<boolean>(false)
    const type = ref< 'month' | 'year'>('month')
    const salesReportData = ref([])
    const handleSelect = (selectedType) => {
      type.value = selectedType
    }
    return {
      loading,
      type,
      salesReportData,
      handleSelect,
      salesReportTableColumns
    }
  },
  watch: {
    type: {
      async handler (type) {
        const res = await this.$api.getSalesReport({type})
        this.salesReportData = res.data                
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
:deep(.el-menu) {
  display: flex;
  justify-content: space-evenly;
}
</style>
