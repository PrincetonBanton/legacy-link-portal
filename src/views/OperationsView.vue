<template>
  <div class="dashboard-wrapper">
    <div v-if="isFetching" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div v-else class="main-content">
      <div v-if="fetchError" class="error-card">
        <h4 style="margin: 0;">Secure Connection Pipeline Interrupted</h4>
        <p style="font-size: large; font-family: monospace;">{{ fetchError }}</p>
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

            <OperationsVisualizer 
              :lineChartData="lineChartData"
              :barChartData="barChartData"
              :blockMetricsData="blockMetricsData"
              :pieMetricsData="pieMetricsData" 
            />
          </div>

          <div v-else class="workspace-unselected-state">
             <img src="/sodaco.png" class="splash-logo animate-pulse" alt="Sodaco Splash Logo" />
             <h2 class="splash-company-title">SODACO</h2>
             <p class="splash-status-text">Please pick a Block and Dataset profile from the top navigation bar to mount views.</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useOwnerAnalysis } from '../composables/useOwnerAnalysis.js'
import { exportToPDF, executeCSVExportPipeline } from '../utils/dashboardActions.js'
import { transformLineChartData, transformBarChartData, routePieMetricsData } from '../utils/chartTransformers.js'

import OperationsToolbar from '../components/OperationsToolbar.vue'
import OperationsVisualizer from '../components/OperationsVisualizer.vue'

// ⚡ Dynamic Context bound from the Global Navbar Dropdowns
const props = defineProps({
  selectedContext: {
    type: Object,
    default: null
  }
})

const { 
  isFetching, fetchError, dailyTrendsData, blockMetricsData, productMetricsData, groupMetricsData,
  fetchRawExportDataset, fetchTrends, fetchBlockAggregations, fetchProductAggregations, fetchGroupAggregations
} = useOwnerAnalysis()

// Watcher: Re-run your operational charts and graphs immediately when the navbar dropdown selects change
watch(
  () => props.selectedContext,
  (newContext) => {
    if (newContext?.area && newContext?.systemType) {
      triggerPipelineUpdate(newContext.isoMinDate, newContext.isoMaxDate)
    }
  },
  { immediate: true, deep: true }
)

const manualRefresh = async () => {
  if (!props.selectedContext) return
  await triggerPipelineUpdate(props.selectedContext.isoMinDate, props.selectedContext.isoMaxDate)
}

const handleViewportUpdate = (range) => {
  triggerPipelineUpdate(range.minDate, range.maxDate)
}

const handleDashboardExportCSV = async () => {
  if (!props.selectedContext) return
  isFetching.value = true 
  await executeCSVExportPipeline(props.selectedContext, fetchRawExportDataset)
  isFetching.value = false
}

const handleDashboardPrint = () => {
  if (!props.selectedContext) return
  exportToPDF(props.selectedContext)
}

// 🚀 Core Data Pipeline Aggregator
const triggerPipelineUpdate = async (min = props.selectedContext?.isoMinDate, max = props.selectedContext?.isoMaxDate) => {
  if (!props.selectedContext) return
  const area = props.selectedContext.area
  const system = props.selectedContext.systemType

  fetchTrends(area, system, min, max)
  fetchBlockAggregations(area, system, min, max)

  if (system === 'Production System') {
    await fetchProductAggregations(area, system, min, max)
  } else {
    await fetchGroupAggregations(area, system, min, max)
  }
}

// Pure Computed Transformations
const lineChartData = computed(() => transformLineChartData(dailyTrendsData.value))
const barChartData = computed(() => transformBarChartData(blockMetricsData.value))
const pieMetricsData = computed(() => routePieMetricsData(props.selectedContext, productMetricsData.value, groupMetricsData.value))
</script>

<style scoped>
.dashboard-wrapper { display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; }
.main-content { display: flex; flex-direction: column; flex: 1; height: 100%; padding: 1.5rem; box-sizing: border-box; overflow: hidden; background: var(--bg-main); transition: background .25s ease; }
.dashboard-grid-fluid { flex: 1; display: flex; flex-direction: column; min-height: 0; height: 100%; }
.workspace { display: flex; flex-direction: column; flex: 1; height: 100%; min-height: 0; position: relative; }
.workspace-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; min-height: 0; overflow: hidden; }
.loading-overlay { position: absolute; inset: 0; background: var(--bg-main); display: flex; align-items: center; justify-content: center; z-index: 100; transition: background .25s ease; }
.spinner { width: 48px; height: 48px; border: 4px solid var(--border-color); border-top-color: #10b981; border-radius: 50%; animation: spin-clockwise 0.8s linear infinite; }
.error-card { background: #4c1d1d; border: 1px solid #991b1b; padding: 1rem; border-radius: 10px; text-align: left; color: #fecaca; }
.workspace-unselected-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; margin: auto; text-align: center; }
.splash-logo { width: 155px; height: 155px; border-radius: 50%; object-fit: cover; opacity: 0.25; filter: grayscale(100%); transition: opacity 0.3s ease; }
.splash-company-title { font-weight: 800; color: var(--text-main); margin: 1rem 0 0.25rem 0; letter-spacing: 0.05em; transition: color .25s ease; }
.splash-status-text { font-size: .8rem; color: var(--text-muted); margin: 0; padding: 0 2rem; max-width: 400px; transition: color .25s ease; }
@keyframes spin-clockwise { to { transform: rotate(360deg); } }
</style>