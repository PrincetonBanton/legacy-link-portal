<template>
  <div class="dashboard-wrapper">
    <div v-if="isFetching" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div v-else class="main-content">
      <div v-if="fetchError" class="error-card">
        <h4>Secure Connection Pipeline Interrupted</h4>
        <p>{{ fetchError }}</p>
      </div>

      <div v-else class="dashboard-grid-fluid">
        <main class="workspace">
          <div v-if="selectedContext" class="workspace-content">
            
            <OperationsToolbar 
              :active-selection="selectedContext"
              :daily-trends="dailyTrendsData"
              @refresh="manualRefresh"
              @update-viewport="handleViewportUpdate"
              @export-csv="handleDashboardExportCSV"
              @trigger-print="handleDashboardPrint"
            />

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

          </div>

          <div v-else class="workspace-unselected-state">
             <img src="/sodaco.png" class="splash-logo" alt="Sodaco Splash Logo" />
             <h2 class="splash-company-title">SODACO</h2>
             <p class="splash-status-text">Please pick a Block and Dataset profile from the top navigation bar to mount views.</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, computed } from 'vue'
import { useOwnerAnalysis } from '../composables/useOwnerAnalysis.js'
import { exportToPDF, executeCSVExportPipeline } from '../utils/dashboardActions.js'
import { transformLineChartData, transformBarChartData, routePieMetricsData } from '../utils/chartTransformers.js'

// Child Graph Elements imported directly here
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
  if (props.selectedContext) exportToPDF(props.selectedContext)
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

// Data Transformers
const lineChartData = computed(() => transformLineChartData(dailyTrendsData.value))
const barChartData = computed(() => transformBarChartData(blockMetricsData.value))
const pieMetricsData = computed(() => routePieMetricsData(props.selectedContext, productMetricsData.value, groupMetricsData.value))
const limitedBlockMetrics = computed(() => props.blockMetricsData?.slice(0, 12) || [])
</script>

<style scoped>
/* Main Structural Layout Layouts */
.dashboard-wrapper { display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; }
.main-content { display: flex; flex-direction: column; flex: 1; height: 100%; padding: 1.5rem; box-sizing: border-box; overflow: hidden; background: var(--bg-main); }
.dashboard-grid-fluid { flex: 1; display: flex; flex-direction: column; min-height: 0; height: 100%; }
.workspace { display: flex; flex-direction: column; flex: 1; height: 100%; min-height: 0; position: relative; }
.workspace-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; min-height: 0; overflow: hidden; }

/* Absorbed Grid Styles from Visualizer */
.visualization-grid { flex: 1; display: grid; grid-template-columns: 1fr 340px; gap: 1rem; min-height: 0; overflow: hidden; }
.chart-stack { display: grid; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 1rem; min-height: 0; height: 100%; }
.distribution-stack { display: grid; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 1rem; min-height: 0; height: 100%; }

/* Feedback States */
.loading-overlay { position: absolute; inset: 0; background: var(--bg-main); display: flex; align-items: center; justify-content: center; z-index: 100; }
.spinner { width: 48px; height: 48px; border: 4px solid var(--border-color); border-top-color: #10b981; border-radius: 50%; animation: spin-clockwise 0.8s linear infinite; }
.error-card { background: #4c1d1d; border: 1px solid #991b1b; padding: 1rem; border-radius: 10px; text-align: left; color: #fecaca; }
.workspace-unselected-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; margin: auto; text-align: center; }
.splash-logo { width: 155px; height: 155px; border-radius: 50%; object-fit: cover; opacity: 0.25; filter: grayscale(100%); }
.splash-company-title { font-weight: 800; color: var(--text-main); margin: 1rem 0 0.25rem 0; letter-spacing: 0.05em; }
.splash-status-text { font-size: .8rem; color: var(--text-muted); margin: 0; padding: 0 2rem; max-width: 400px; }
@keyframes spin-clockwise { to { transform: rotate(360deg); } }
</style>