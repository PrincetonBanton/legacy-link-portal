<template>
  <div class="widescreen-analytics-hub">
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
    />

    <div class="split-layout">
      
      <div class="left-col">
        <AnalyticsTable 
          :active-dataset-type="activeDatasetType"
          :table-title="getTableTitle"
          :rows="currentTableRows"
        />
      </div>

      <div class="right-col">
        <div class="insights-panel" :class="{ 'error-panel': hasError, 'awaiting-panel': !aiResponse }">
          <div class="panel-header">
            <strong>{{ hasError ? 'Diagnostic Error Log:' : 'AI Executive Summary:' }}</strong>
          </div>
          <div class="insights-content">
            <p class="status-text">{{ aiResponse || 'Awaiting execution request. Click the action button to process the dataset grid matrix...' }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useOwnerAnalysis } from '../composables/useOwnerAnalysis.js'
import AnalyticsToolbar from '../components/graphscharts/AnalyticsToolbar.vue'
import AnalyticsTable from '../components/graphscharts/AnalyticsTable.vue'

const props = defineProps({
  selectedContext: {
    type: Object,
    default: null
  }
})

const { 
  isFetching, 
  dailyTrendsData, 
  blockMetricsData, 
  productMetricsData, 
  groupMetricsData, 
  fetchTrends, 
  fetchBlockAggregations,
  fetchProductAggregations,
  fetchGroupAggregations
} = useOwnerAnalysis()

const activeDatasetType = ref('trends')
const isGenerating = ref(false)
const aiResponse = ref('')
const hasError = ref(false)

const endpoint = 'https://api.groq.com/openai/v1/chat/completions'

const getTableTitle = computed(() => {
  if (activeDatasetType.value === 'trends') return 'Daily Operational Trends'
  if (activeDatasetType.value === 'blocks') return 'Sector Block Aggregations'
  if (activeDatasetType.value === 'products') return 'Product Inventory Breakdown'
  return 'Logistical Category Group Aggregations'
})

const currentTableRows = computed(() => {
  if (activeDatasetType.value === 'trends') return dailyTrendsData.value
  if (activeDatasetType.value === 'blocks') return blockMetricsData.value
  if (activeDatasetType.value === 'products') return productMetricsData.value
  if (activeDatasetType.value === 'groups') return groupMetricsData.value
  return []
})

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
        content: `You are an expert data analyst, and data comes from agriculture crops operation mainly pomelo, durian, mango. Review the following snapshot data layer containing ${pipelineContextDesc}.
                  Provide a brief, high-impact bulleted analysis using exactly these four structured headers:
                    1. The Operational Pulse Audit (Executive Summary)
                    2. Dynamic Anomaly Detection
                    3. Preventive Maintenance / Action Items
                    4. Projection`
      },
      { 
        role: "user", 
        content: `Analyze this active payload object grid: ${JSON.stringify(currentTableRows.value)}` 
      }
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
.widescreen-analytics-hub { width: 100%; min-height: 85vh; display: flex; flex-direction: column; padding: 2rem; box-sizing: border-box; background: #ffffff; font-family: system-ui, -apple-system, sans-serif; }
.split-layout { display: flex; gap: 2.5rem; align-items: stretch; width: 100%; flex-grow: 1; margin-top: 0.5rem; }
.left-col { flex: 1.2; display: flex; flex-direction: column; gap: 1.5rem; }
.right-col { flex: 1; display: flex; }

.insights-panel { padding: 1.5rem; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; text-align: left; width: 100%; display: flex; flex-direction: column; flex-grow: 1; box-sizing: border-box; }
.awaiting-panel { background: #f8fafc; border-left-color: #cbd5e1; }
.error-panel { background: #fef2f2; border-left-color: #ef4444; }
.panel-header { font-size: 0.68rem; color: #166534; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 1rem; border-bottom: 1px dashed rgba(0,0,0,0.08); padding-bottom: 6px; }
.awaiting-panel .panel-header { color: #475569; }
.error-panel .panel-header { color: #991b1b; }
.insights-content { flex-grow: 1; overflow-y: auto; max-height: 580px; padding-right: 6px; }
.status-text { color: #1e293b; font-size: 0.78rem; margin: 0; line-height: 1.6; white-space: pre-line; }
.awaiting-panel .status-text { color: #94a3b8; font-style: italic; font-weight: 600; }

/* Dynamic Print Mode Query Adjustments */
@media print {
  .step-testing-panel, .ai-trigger-btn, .btn-utility { display: none !important; }
  .widescreen-analytics-hub { padding: 0; }
  .split-layout { display: block; }
  .right-col { margin-top: 2rem; }
}

@media (max-width: 900px) { .split-layout { flex-direction: column; gap: 2rem; } }
</style>