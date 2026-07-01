<template>
  <div class="visualization-grid">
    <div class="chart-stack">
      <AdminLineGraph :chartData="lineChartData" />
      <AdminBarGraph :chartData="barChartData" />
    </div>

    <div class="distribution-stack">
      <AdminRankingPanel :metricsData="limitedBlockMetrics" />
      <AdminDistributionPanel :metricsData="pieMetricsData" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue' // 🍇 Clean macro handling
import AdminLineGraph from './graphscharts/AdminLineGraph.vue'
import AdminBarGraph from './graphscharts/AdminBarGraph.vue'
import AdminRankingPanel from './graphscharts/AdminRankingPanel.vue'
import AdminDistributionPanel from './graphscharts/AdminDistributionPanel.vue'

const props = defineProps({
  lineChartData: { type: Object, required: true },
  barChartData: { type: Object, required: true },
  blockMetricsData: { type: Array, required: true },
  pieMetricsData: { type: Array, required: true }
})

// 📈 Create a computed property to safe-guard the table row size for the UI & PDF
const limitedBlockMetrics = computed(() => {
  if (!props.blockMetricsData) return []
  // Grabs only the first 10 items. Change the 10 to 12 if you prefer!
  return props.blockMetricsData.slice(0, 12) 
})
</script>

<style scoped>
.visualization-grid { flex: 1; display: grid; grid-template-columns: 1fr 340px; gap: 1rem; min-height: 0; overflow: hidden; }
.chart-stack { display: grid; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 1rem; min-height: 0; flex: 1; height: 100%; }
.distribution-stack { display: grid; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 1rem; min-height: 0; height: 100%; }
</style>