<template>
  <div class="widescreen-analytics-hub">
    <div class="split-layout">
      
      <div class="left-col">
        <div class="step-testing-panel">
          <button 
            class="pipeline-btn theme-emerald" 
            :class="{ 'is-active': activeDatasetType === 'trends' }"
            @click="handleFetchTrendsClick" 
            :disabled="isFetching"
          >
            {{ isFetching && activeDatasetType === 'trends' ? 'Fetching...' : 'Invoice' }}
          </button>

          <button 
            class="pipeline-btn theme-sky" 
            :class="{ 'is-active': activeDatasetType === 'blocks' }"
            @click="handleFetchBlocksClick" 
            :disabled="isFetching"
          >
            {{ isFetching && activeDatasetType === 'blocks' ? 'Fetching...' : 'Blocking' }}
          </button>

          <button 
            class="pipeline-btn theme-purple" 
            :class="{ 
              'is-active': activeDatasetType === 'products',
              'system-restricted': props.selectedContext?.systemType !== 'Production System'
            }"
            @click="handleFetchProductsClick" 
            :disabled="isFetching || props.selectedContext?.systemType !== 'Production System'"
          >
            {{ isFetching && activeDatasetType === 'products' ? 'Fetching...' : 'Product' }}
          </button>

          <button 
            class="pipeline-btn theme-pink" 
            :class="{ 
              'is-active': activeDatasetType === 'groups',
              'system-restricted': props.selectedContext?.systemType === 'Production System'
            }"
            @click="handleFetchGroupsClick" 
            :disabled="isFetching || props.selectedContext?.systemType === 'Production System'"
          >
            {{ isFetching && activeDatasetType === 'groups' ? 'Fetching...' : 'Category' }}
          </button>

          <button 
            class="ai-trigger-btn" 
            @click="runDynamicDatasetAnalysis" 
            :disabled="isGenerating || !currentTableRows?.length"
            :title="`Analyze ${activeDatasetType.toUpperCase()} Dataset`"
          >
            <span>{{ isGenerating ? 'Computing...' : 'Run AI ✨' }}</span>
          </button>
        </div>

        <div class="table-container">
          <h3>📊 Live {{ getTableTitle }}</h3>
          
          <div class="table-scroll-wrapper">
            <table class="mock-table">
              <thead>
                <tr v-if="activeDatasetType === 'trends'">
                  <th>Trend Date</th>
                  <th>Invoice Count</th>
                  <th>Total Financial Value</th>
                </tr>
                <tr v-else-if="activeDatasetType === 'blocks'">
                  <th>Block Identifier</th>
                  <th>Total Value</th>
                </tr>
                <tr v-else-if="activeDatasetType === 'products'">
                  <th>Product Variant Code</th>
                  <th>Aggregated Value</th>
                </tr>
                <tr v-else-if="activeDatasetType === 'groups'">
                  <th>Logistical Group Class</th>
                  <th>Aggregated Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!currentTableRows || currentTableRows.length === 0">
                  <td :colspan="activeDatasetType === 'trends' ? 3 : 2" class="empty-row-cell">
                    No records found. Trigger an active pipeline node above.
                  </td>
                </tr>
                
                <template v-else>
                  <tr v-if="activeDatasetType === 'trends'" v-for="(row, index) in currentTableRows" :key="'trend-' + index">
                    <td class="product-name-cell">{{ row.trend_date }}</td>
                    <td>{{ row.invoice_count }}</td>
                    <td class="revenue-cell">₱{{ Number(row.total_financial_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                  </tr>

                  <tr v-if="activeDatasetType === 'blocks'" v-for="(row, index) in currentTableRows" :key="'block-' + index">
                    <td class="product-name-cell">{{ row.identifier }}</td>
                    <td class="revenue-cell">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                  </tr>

                  <tr v-if="activeDatasetType === 'products'" v-for="(row, index) in currentTableRows" :key="'prod-' + index">
                    <td class="product-name-cell">{{ row.identifier || 'Unknown Product' }}</td>
                    <td class="revenue-cell">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                  </tr>

                  <tr v-if="activeDatasetType === 'groups'" v-for="(row, index) in currentTableRows" :key="'grp-' + index">
                    <td class="product-name-cell">{{ row.group_name || row.identifier || 'Unknown Group' }}</td>
                    <td class="revenue-cell">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
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
/* Maximize Available Heights on Layout Containers */
.widescreen-analytics-hub { width: 100%; min-height: 85vh; display: flex; padding: 2rem; box-sizing: border-box; background: #ffffff; font-family: system-ui, -apple-system, sans-serif; }
.split-layout { display: flex; gap: 2.5rem; align-items: stretch; width: 100%; flex-grow: 1; }
.left-col { flex: 1.2; display: flex; flex-direction: column; gap: 1.5rem; }
.right-col { flex: 1; display: flex; }

/* Upper Header Controls Dock without Dashed Border */
.step-testing-panel { padding: 1rem; background: #f8fafc; border-radius: 8px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

/* Control Selection Button and Hover State Logic */
.pipeline-btn { margin: 0; width: auto; padding: 8px 16px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; border-radius: 50px; cursor: pointer; border: 1px solid transparent; color: white; opacity: 0.45; transition: opacity 0.2s ease, transform 0.1s ease; }
.pipeline-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
.pipeline-btn.is-active { opacity: 1 !important; transform: none !important; }
.pipeline-btn:disabled { cursor: not-allowed; }

/* System Context Filtering Behavior */
.pipeline-btn.system-restricted { background: #64748b !important; opacity: 0.25 !important; cursor: not-allowed; }

/* Background Theme Color Schemes */
.pipeline-btn.theme-emerald { background: #10b981; }
.pipeline-btn.theme-sky { background: #3b82f6; }
.pipeline-btn.theme-purple { background: #8b5cf6; }
.pipeline-btn.theme-pink { background: #ec4899; }

/* Right-aligned Trigger Action Buttons */
.ai-trigger-btn { margin-left: auto; background: #0f172a; color: white; border: none; padding: 8px 14px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; border-radius: 50px; cursor: pointer; transition: background 0.15s ease, transform 0.1s ease; display: flex; align-items: center; gap: 4px; }
.ai-trigger-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-1px); }
.ai-trigger-btn:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; }

/* Grid View Scrolling Table Container Architecture */
.table-container { text-align: left; display: flex; flex-direction: column; flex-grow: 1; width: 100%; }
.table-container h3 { font-size: 0.9rem; color: #334155; margin: 0 0 1rem 0; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; }
.table-scroll-wrapper { flex-grow: 1; max-height: 550px; overflow-y: auto; border: 1px solid #edf2f7; border-radius: 6px; background: #ffffff; }
.mock-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left; }
.mock-table th { background: #f8fafc; color: #64748b; padding: 12px; border-bottom: 1px solid #edf2f7; font-weight: 800; font-size: 0.68rem; letter-spacing: 0.03em; position: sticky; top: 0; z-index: 1; }
.mock-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.75rem; box-sizing: border-box; vertical-align: middle; }
.product-name-cell { font-family: system-ui, sans-serif !important; font-weight: 600; color: #0f172a !important; }
.revenue-cell { font-weight: 600; color: #16a34a; }
.mock-table tr:hover td { background: #f8fafc; }
.empty-row-cell { text-align: center; color: #94a3b8; padding: 30px; font-style: italic; }

/* Lateral Insight Display Flex Architecture */
.insights-panel { padding: 1.5rem; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; text-align: left; width: 100%; display: flex; flex-direction: column; flex-grow: 1; box-sizing: border-box; }
.awaiting-panel { background: #f8fafc; border-left-color: #cbd5e1; }
.error-panel { background: #fef2f2; border-left-color: #ef4444; }
.panel-header { font-size: 0.68rem; color: #166534; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 1rem; border-bottom: 1px dashed rgba(0,0,0,0.08); padding-bottom: 6px; }
.awaiting-panel .panel-header { color: #475569; }
.error-panel .panel-header { color: #991b1b; }
.insights-content { flex-grow: 1; overflow-y: auto; max-height: 580px; padding-right: 6px; }
.status-text { color: #1e293b; font-size: 0.78rem; margin: 0; line-height: 1.6; white-space: pre-line; }
.awaiting-panel .status-text { color: #94a3b8; font-style: italic; font-weight: 600; }

@media (max-width: 900px) { .split-layout { flex-direction: column; gap: 2rem; } }
</style>