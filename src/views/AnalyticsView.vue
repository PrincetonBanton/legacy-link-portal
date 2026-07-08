<template>
  <div class="analytics-view-wrapper">
    <AnalyticsToolbar 
      :active-dataset-type="activeDatasetType"
      :selected-context="props.selectedContext"
      :is-fetching="isFetching"
      :is-generating="isGenerating"
      :has-rows="!!currentTableRows?.length"
      @fetch-trends="handleFetchTrendsClick"
      @fetch-blocks="handleFetchBlocksClick"
      @fetch-products="handleFetchProductsClick"
      @fetch-groups="handleFetchGroupsClick"
      @run-analysis="runDynamicDatasetAnalysis"
      @trigger-print="handleAnalyticsPrint" 
    />

    <div class="analytics-body-grid">
      <div class="analytics-left-panel">
        <div class="table-scroll-frame">
          <AnalyticsTable 
            :active-dataset-type="activeDatasetType"
            :rows="currentTableRows"
          />
        </div>
      </div>

      <div class="analytics-right-panel">
        <AnalyticsInsightPanel 
          :ai-response="aiResponse"
          :has-error="hasError"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useOwnerAnalysis } from '../composables/useOwnerAnalysis.js'
import { exportToPDF } from '../utils/dashboardActions.js' 

import AnalyticsToolbar from '../components/AnalyticsToolbar.vue'
import AnalyticsTable from '../components/graphscharts/AnalyticsTable.vue'
import AnalyticsInsightPanel from '../components/graphscharts/AnalyticsInsightPanel.vue'

const props = defineProps({
  selectedContext: { type: Object, default: null }
})

const { 
  isFetching, dailyTrendsData, blockMetricsData, productMetricsData, groupMetricsData, 
  fetchTrends, fetchBlockAggregations, fetchProductAggregations, fetchGroupAggregations
} = useOwnerAnalysis()

const activeDatasetType = ref('trends')
const isGenerating = ref(false)
const aiResponse = ref('')
const hasError = ref(false)

const endpoint = 'https://api.groq.com/openai/v1/chat/completions'

const currentTableRows = computed(() => {
  if (activeDatasetType.value === 'trends') return dailyTrendsData.value
  if (activeDatasetType.value === 'blocks') return blockMetricsData.value
  if (activeDatasetType.value === 'products') return productMetricsData.value
  if (activeDatasetType.value === 'groups') return groupMetricsData.value
  return []
})

const handleAnalyticsPrint = () => {
  if (props.selectedContext) {
    exportToPDF(props.selectedContext, '.analytics-body-grid', true)
  }
}

const handleFetchTrendsClick = async () => {
  if (!props.selectedContext?.area) return alert("⚠️ No enterprise area chosen yet!")
  activeDatasetType.value = 'trends'
  const { area, systemType, isoMinDate, isoMaxDate } = props.selectedContext
  await fetchTrends(area, systemType, isoMinDate, isoMaxDate)
}

const handleFetchBlocksClick = async () => {
  if (!props.selectedContext?.area) return alert("⚠️ No enterprise area chosen yet!")
  activeDatasetType.value = 'blocks'
  const { area, systemType, isoMinDate, isoMaxDate } = props.selectedContext
  await fetchBlockAggregations(area, systemType, isoMinDate, isoMaxDate)
}

const handleFetchProductsClick = async () => {
  if (!props.selectedContext?.area) return alert("⚠️ No enterprise area chosen yet!")
  activeDatasetType.value = 'products'
  const { area, systemType, isoMinDate, isoMaxDate } = props.selectedContext
  await fetchProductAggregations(area, systemType, isoMinDate, isoMaxDate)
}

const handleFetchGroupsClick = async () => {
  if (!props.selectedContext?.area) return alert("⚠️ No enterprise area chosen yet!")
  activeDatasetType.value = 'groups'
  const { area, systemType, isoMinDate, isoMaxDate } = props.selectedContext
  await fetchGroupAggregations(area, systemType, isoMinDate, isoMaxDate)
}

const runDynamicDatasetAnalysis = async () => {
  isGenerating.value = true
  hasError.value = false
  aiResponse.value = `Analyzing active ${activeDatasetType.value} matrix distribution parameters...`

  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    hasError.value = true
    aiResponse.value = 'Configuration Error: VITE_GROQ_API_KEY is missing.'
    isGenerating.value = false
    return
  }

  let pipelineContextDesc = ''
  if (activeDatasetType.value === 'trends') pipelineContextDesc = 'daily operational trends'
  else if (activeDatasetType.value === 'blocks') pipelineContextDesc = 'sector operational blocks'
  else if (activeDatasetType.value === 'products') pipelineContextDesc = 'deep item units and sales volumes'
  else pipelineContextDesc = 'generalized logistical category groups'

  const requestBody = {
    model: "llama-3.1-8b-instant",
    messages: [
      { 
        role: "system", 
        content: `You are an expert data analyst, and data comes from agriculture crops operation mainly pomelo, durian, mango. Review the following snapshot data layer containing ${pipelineContextDesc}.\nProvide a brief, high-impact bulleted analysis using exactly these four structured headers:\n1. The Operational Pulse Audit (Executive Summary)\n2. Dynamic Anomaly Detection\n3. Preventive Maintenance / Action Items\n4. Projection`
      },
      { role: "user", content: `Analyze this active payload object grid: ${JSON.stringify(currentTableRows.value)}` }
    ],
    temperature: 0.2,
    max_tokens: 1200
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody)
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    aiResponse.value = result.choices[0]?.message?.content || '⚠️ Empty summary response payload generated.'
  } catch (err) {
    hasError.value = true
    aiResponse.value = `Analysis Failed: ${err.message}`
  } finally {
    isGenerating.value = false
  }
}

watch(
  () => props.selectedContext,
  () => {
    if (dailyTrendsData.value) dailyTrendsData.value = []
    if (blockMetricsData.value) blockMetricsData.value = []
    if (productMetricsData.value) productMetricsData.value = []
    if (groupMetricsData.value) groupMetricsData.value = []
    aiResponse.value = ''
    hasError.value = false
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
/* 🖥️ SCREEN (BALANCED 50/50 SPLIT) */
.analytics-view-wrapper { display: flex; flex-direction: column; width: 100%; height: 100vh; box-sizing: border-box; padding: 1rem; overflow: hidden; }
.analytics-body-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr; gap: 16px; width: 100%; flex: 1; min-height: 0; }
.analytics-left-panel { grid-column: 1; display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; min-width: 0; height: 100%; overflow: hidden; }
.analytics-right-panel { grid-column: 2; display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; min-width: 0; height: 100%; overflow: hidden; }
.table-scroll-frame { flex: 1; overflow-y: auto; padding: 0; min-height: 0; }

/* 🖨️ PRINT (FLUID STACKING OVERRIDES) */
:global(.html2pdf__container) .analytics-view-wrapper, :global(.html2pdf__container) .analytics-body-grid { display: block !important; height: auto !important; max-height: none !important; overflow: visible !important; width: 100% !important; }
:global(.html2pdf__container) .analytics-left-panel, :global(.html2pdf__container) .analytics-right-panel { display: block !important; width: 100% !important; height: auto !important; max-height: none !important; overflow: visible !important; grid-column: auto !important; }
:global(.html2pdf__container) .table-scroll-frame { overflow: visible !important; height: auto !important; max-height: none !important; display: block !important; }
</style>