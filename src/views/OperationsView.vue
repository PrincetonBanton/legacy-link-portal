<template>
  <div class="operation-view-wrapper">
    <OperationsToolbar 
      v-if="selectedContext"
      :active-selection="selectedContext"
      :daily-trends="dailyTrendsData"
      @refresh="manualRefresh"
      @update-viewport="handleViewportUpdate"
      @export-csv="handleDashboardExportCSV"
      @trigger-print="handleDashboardPrint"
    />

    <div class="operation-body-grid">
      <OperationSpinner v-if="isFetching" />
      <OperationErrorCard v-else-if="fetchError" :error-message="fetchError" />
      <template v-else-if="selectedContext">
        <div class="visualization-grid">
          <div class="chart-stack">
            <AdminLineGraph 
              :chartData="lineChartData" 
              :area-name="selectedContext?.area"
              :system-type="selectedContext?.systemType"
            />
            <AdminBarGraph :chartData="barChartData" />
          </div>

          <div class="distribution-stack">
            <AdminRankingPanel :metricsData="limitedBlockMetrics" />
            <AdminDistributionPanel :metricsData="pieMetricsData" />
          </div>
        </div>
      </template>

      <div v-else class="workspace-unselected-state">
        <img src="/sodaco.png" class="splash-logo" alt="Sodaco Splash Logo" />
        <h2 class="splash-company-title">SODACO</h2>
        <p class="splash-status-text">Please pick a Block and Dataset profile from the top navigation bar to mount views.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { watch, computed } from 'vue'
import { useOwnerAnalysis } from '../composables/useOwnerAnalysis.js'
import { exportToPDF, executeCSVExportPipeline } from '../utils/dashboardActions.js'
import { transformLineChartData, transformBarChartData, routePieMetricsData } from '../utils/chartTransformers.js'

import OperationSpinner from '../components/uihelpers/OperationSpinner.vue'
import OperationErrorCard from '../components/uihelpers/OperationErrorCard.vue'

// Core Layout Elements
import OperationsToolbar from '../components/OperationsToolbar.vue'
import AdminLineGraph from '../components/graphscharts/AdminLineGraph.vue'
import AdminBarGraph from '../components/graphscharts/AdminBarGraph.vue'
import AdminRankingPanel from '../components/graphscharts/AdminRankingPanel.vue'
import AdminDistributionPanel from '../components/graphscharts/AdminDistributionPanel.vue'

const props = defineProps({
  selectedContext: { type: Object, default: null }
})

const { 
  isFetching, fetchError, dailyTrendsData, blockMetricsData, productMetricsData, groupMetricsData,
  fetchRawExportDataset, fetchTrends, fetchBlockAggregations, fetchProductAggregations, fetchGroupAggregations
} = useOwnerAnalysis()

watch(
  () => props.selectedContext,
  (newContext) => {
    if (newContext?.area && newContext?.systemType) {
      triggerPipelineUpdate(newContext.isoMinDate, newContext.isoMaxDate)
    }
  },
  { immediate: true, deep: true }
)

const manualRefresh = () => triggerPipelineUpdate()
const handleViewportUpdate = (range) => triggerPipelineUpdate(range.minDate, range.maxDate)

const handleDashboardExportCSV = async () => {
  if (!props.selectedContext) return
  await executeCSVExportPipeline(props.selectedContext, fetchRawExportDataset)
}

const handleDashboardPrint = () => {
  if (props.selectedContext) exportToPDF(props.selectedContext, '.visualization-grid', true)
}

const triggerPipelineUpdate = async (min = props.selectedContext?.isoMinDate, max = props.selectedContext?.isoMaxDate) => {
  if (!props.selectedContext) return
  const { area, systemType: system } = props.selectedContext

  await Promise.all([
    fetchTrends(area, system, min, max),
    fetchBlockAggregations(area, system, min, max),
    system === 'Production System' 
      ? fetchProductAggregations(area, system, min, max) 
      : fetchGroupAggregations(area, system, min, max)
  ])
}

const lineChartData = computed(() => transformLineChartData(dailyTrendsData.value))
const barChartData = computed(() => transformBarChartData(blockMetricsData.value))
const pieMetricsData = computed(() => routePieMetricsData(props.selectedContext, productMetricsData.value, groupMetricsData.value))
const limitedBlockMetrics = computed(() => blockMetricsData.value || [])
</script>

<style scoped>
.operation-view-wrapper { display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; box-sizing: border-box; padding: 0 1.5rem 1rem 1.5rem; gap: 14px; }
.operation-body-grid { flex: 1; display: flex; flex-direction: column; min-height: 0; height: 100%; position: relative; }

.visualization-grid { flex: 1; display: grid; grid-template-columns: 1fr 340px; gap: 1rem; min-height: 0; overflow: hidden; }
.chart-stack { display: grid; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 1rem; min-height: 0; height: 100%; }
.distribution-stack { display: grid; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 1rem; min-height: 0; height: 100%; }

.workspace-unselected-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; margin: auto; text-align: center; }
.splash-logo { width: 155px; height: 155px; border-radius: 50%; object-fit: cover; opacity: 0.25; filter: grayscale(100%); }
.splash-company-title { font-weight: 800; color: var(--text-main); margin: 1rem 0 0.25rem 0; letter-spacing: 0.05em; }
.splash-status-text { font-size: .8rem; color: var(--text-muted); margin: 0; padding: 0 2rem; max-width: 400px; }

/* 🖨️ HTML2PDF PRINT COMPATIBILITY EXTRAS */
:global(.html2pdf__container) .operation-view-wrapper,
:global(.html2pdf__container) .operation-body-grid,
:global(.html2pdf__container) .visualization-grid,
:global(.html2pdf__container) .chart-stack,
:global(.html2pdf__container) .distribution-stack {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}
</style>