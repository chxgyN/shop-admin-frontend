<template>
  <div style="display: flex;flex-direction: column;align-items: center;">
    <el-menu
      default-active="month"
      mode="horizontal"
      style="margin-bottom: 30px;"
      @select="typeShow = $event"
    >
      <el-menu-item index="month">
        月
      </el-menu-item>
      <el-menu-item index="year">
        年
      </el-menu-item>
    </el-menu>
    <div
      v-if="typeShow === 'month'"
      id="month-sales-chart"
      class="sales-chart"
    />
    <div
      v-if="typeShow === 'year'"
      id="year-sales-chart"
      class="sales-chart"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import monthSalesChartOption from './chartOptions/monthSalesChartOption'
import yearSalesChartOption from './chartOptions/yearSalesChartOption'
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { TransformComponent } from "echarts/components";
// import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  LineChart,
  CanvasRenderer,
  TransformComponent
  // UniversalTransition
]);

export default defineComponent({
  name: 'StatisticCharts',
  setup () {
    const monthSalesChartOptionRef = ref(monthSalesChartOption)
    const yearSalesChartOptionRef = ref(yearSalesChartOption)
    const typeShow = ref('month')
    return {
      monthSalesChartOption: monthSalesChartOptionRef,
      yearSalesChartOption: yearSalesChartOptionRef,
      typeShow
    }
  },
  watch: {
    typeShow: {
      handler (val) {
        if (val === 'month') {
          this.initMonthChart('month', this.monthSalesChartOption)
        } else if (val === 'year') {
          this.initMonthChart('year', this.yearSalesChartOption)
        }
      },
      immediate: true
    }
  },
  //dom更新机制 ,渲染先后????
  methods: {  
    initMonthChart (type: string, option) {
      this.$nextTick(async () => { 
        const salesChart = echarts.init(document.getElementById(type + '-sales-chart'))
        const res = await this.$api.getTotalSales({ type })        
        //将数组每个元素都调用后面的函数，组成新的数组
        const data = res.data.map(item => item.totalSales)
        // 横坐标        
        option.xAxis.data = res.data.map((item, idx) => (idx + 1))
        // 销售额
        option.series[0].data = data
        // 利润
        option.series[1].data = res.data.map(item => item.totalProfit)
        salesChart.setOption(option)
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.sales-chart {
  width: 80%;
  height: 500px;
}
:deep(.el-menu) {
  display: flex;
  width: 100%;
  justify-content: space-evenly;
}
</style>
