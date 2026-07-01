<template>
  <div class="widescreen-analytics-hub">
    <div class="split-layout">
      
      <div class="left-col">
        <div class="step-testing-panel" style="margin-bottom: 1.5rem; padding: 1rem; border: 1px dashed #cbd5e1; border-radius: 6px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button 
            class="pipeline-btn" 
            :class="{ 'theme-emerald': activeDatasetType === 'trends' }"
            @click="handleFetchTrendsClick" 
            :disabled="isFetching"
          >
            {{ isFetching && activeDatasetType === 'trends' ? 'Fetching...' : '1. Trends 📈' }}
          </button>

          <button 
            class="pipeline-btn" 
            :class="{ 'theme-sky': activeDatasetType === 'blocks' }"
            @click="handleFetchBlocksClick" 
            :disabled="isFetching"
          >
            {{ isFetching && activeDatasetType === 'blocks' ? 'Fetching...' : '2. Blocks 🧱' }}
          </button>
        </div>

        <div class="table-container">
          <h3>📊 Live {{ activeDatasetType === 'trends' ? 'Daily Operational Trends' : 'Sector Block Aggregations' }}</h3>
          
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
              </thead>
              <tbody>
                <tr v-if="!currentTableRows || currentTableRows.length === 0">
                  <td :colspan="activeDatasetType === 'trends' ? 3 : 2" style="text-align: center; color: #94a3b8; padding: 20px; font-style: italic;">
                    No records found. Click one of the verification pipeline buttons above to stream data nodes.
                  </td>
                </tr>
                
                <template v-else>
                  <tr v-if="activeDatasetType === 'trends'" v-for="(row, index) in currentTableRows" :key="'trend-' + index">
                    <td class="product-name-cell">{{ row.trend_date }}</td>
                    <td>{{ row.invoice_count }}</td>
                    <td class="revenue-cell">₱{{ Number(row.total_financial_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                  </tr>

                  <tr v-else-if="activeDatasetType === 'blocks'" v-for="(row, index) in currentTableRows" :key="'block-' + index">
                    <td class="product-name-cell">{{ row.identifier }}</td>
                    <td class="revenue-cell">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <button class="action-btn" @click="runDynamicDatasetAnalysis" :disabled="isGenerating || !currentTableRows?.length">
          {{ isGenerating ? 'Computing Business Insights...' : `Analyze ${activeDatasetType.toUpperCase()} Dataset 🚀` }}
        </button>
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

// Extract both metrics states and pipeline engines from the global composable
const { 
  isFetching, 
  dailyTrendsData, 
  blockMetricsData, 
  fetchTrends, 
  fetchBlockAggregations 
} = useOwnerAnalysis()

// Track which pipeline configuration we are analyzing right now
const activeDatasetType = ref('trends') // 'trends' or 'blocks'
const isGenerating = ref(false)
const aiResponse = ref('')
const hasError = ref(false)

const endpoint = 'https://api.groq.com/openai/v1/chat/completions'

// 🌟 Computed property to feed the correct data matrix array to our loop engine
const currentTableRows = computed(() => {
  return activeDatasetType.value === 'trends' ? dailyTrendsData.value : blockMetricsData.value
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

// 🌟 Dynamic AI Prompt Generator depending on which context step dataset is active
const runDynamicDatasetAnalysis = async () => {
  isGenerating.value = true
  hasError.value = false
  aiResponse.value = `Analyzing active ${activeDatasetType.value} matrices and formatting balance matrix...`

  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    hasError.value = true
    aiResponse.value = 'Configuration Error: VITE_GROQ_API_KEY is missing.'
    isGenerating.value = false
    return
  }

  // Generate dynamic contextual text instructions based on active tracking selection
  const pipelineContextDesc = activeDatasetType.value === 'trends'
    ? 'daily timeline operational metrics metrics (invoice counts and financial velocities)'
    : 'sector operational block distributions (block identifiers and financial allocation points)'

  const requestBody = {
    model: "llama-3.1-8b-instant",
    messages: [
      { 
        role: "system", 
        content: `You are an expert data analyst. Review the following snapshot data layer containing ${pipelineContextDesc}.
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

// 🔄 Watcher: Flushes data frames and text logs instantly when dropdown contexts change
watch(
  () => props.selectedContext,
  (newContext) => {
    // 1. Flush the database caching targets to clear out old rows from the table layout
    if (dailyTrendsData.value) dailyTrendsData.value = []
    if (blockMetricsData.value) blockMetricsData.value = []
    
    // 2. Reset the AI response string block back to its baseline default waiting message
    aiResponse.value = ''
    hasError.value = false

    if (newContext?.area && newContext?.systemType) {
      console.log("🧹 Context changed! Cleared out old datasets and reset AI insights panel framework.")
    }
  },
  { deep: true, immediate: true }
)

</script>

<style scoped>
.widescreen-analytics-hub { width: 100%; padding: 1.2rem; box-sizing: border-box; background: var(--bg-main); font-family: system-ui, sans-serif; height: 100%; display: flex; flex-direction: column; }
.split-layout { display: flex; gap: 16px; align-items: stretch; width: 100%; flex: 1; min-height: 0; }
.left-col { flex: 1.3; display: flex; flex-direction: column; min-width: 0; }
.right-col { flex: 1; display: flex; min-width: 0; }

/* Base & State Rules */
.pipeline-btn { margin: 0; width: auto; padding: 8px 16px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; border-radius: 6px; cursor: pointer; border: 1px solid var(--btn-border, #cbd5e1); color: white; transition: background 0.15s, border-color 0.15s; }
.pipeline-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pipeline-btn.theme-emerald { background: #059669; border-color: #059669; }
.pipeline-btn.theme-sky { background: #0284c7; border-color: #0284c7; }
.pipeline-btn.active { background: #334155 !important; border-color: #334155 !important; }

/* 📊 Table Module & Wrapper Core */
.table-container { text-align: left; display: flex; flex-direction: column; flex: 1; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; min-height: 0; }
.table-container h3 { font-size: 0.68rem; color: var(--text-muted); margin: 0; padding: 10px 14px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; border-bottom: 1px solid var(--border-color); background: var(--bg-surface); }
.table-scroll-wrapper { flex: 1; overflow-y: auto; min-height: 0; }

/* 🧾 Core Matrix Elements */
.mock-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left; }
.mock-table th { background: var(--bg-surface); color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border-color); font-weight: 800; font-size: 0.68rem; letter-spacing: 0.03em; position: sticky; top: 0; z-index: 10; }
.mock-table td { padding: 6px 12px; border-bottom: 1px solid var(--border-color); color: var(--text-main); height: 32px; box-sizing: border-box; vertical-align: middle; transition: background 0.1s; }
.mock-table tr:hover td { background: var(--btn-hover-bg); }
.mock-table th.num, .mock-table td.num { text-align: right; }

/* 🔤 Font & Context Classes */
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.75rem; }
.product-name-cell { font-weight: 600; color: var(--text-main); }
.revenue-cell { font-weight: 700; color: #10b981; }
.code-text { font-weight: 700; color: #0284c7; font-size: 0.72rem; }
:global(.dark-theme) .code-text { color: #38bdf8 !important; }
.empty-msg { text-align: center; color: var(--text-muted); padding: 40px !important; font-size: 0.75rem; font-weight: 600; font-style: italic; }

/* 🚀 Pipeline Control Button System */
.action-btn { background: transparent; border: 1px solid var(--btn-border); color: var(--text-muted); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; width: 100%; height: 36px; margin-top: 12px; box-sizing: border-box; }
.action-btn:hover:not(:disabled) { color: #10b981; border-color: #10b981; background: var(--btn-hover-bg); box-shadow: 0 0 6px rgba(16, 185, 129, 0.15); }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: var(--border-color) !important; color: var(--text-muted) !important; box-shadow: none !important; }

/* 🧠 Intelligence Executive Insights Panels */
.insights-panel { padding: 1.2rem; background: rgba(16, 185, 129, 0.04); border: 1px solid var(--border-color); border-left: 4px solid #10b981; border-radius: 8px; text-align: left; width: 100%; display: flex; flex-direction: column; box-sizing: border-box; }
.panel-header { font-size: 0.65rem; color: #10b981; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 1rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px; }
.insights-content { flex-grow: 1; overflow-y: auto; padding-right: 4px; }
.status-text { color: var(--text-main); font-size: 0.76rem; margin: 0; line-height: 1.6; white-space: pre-line; }

/* 🎨 Panel State Context Modifications */
.awaiting-panel { background: var(--bg-surface); border-left-color: var(--border-color); }
.awaiting-panel .panel-header, .awaiting-panel .status-text { color: var(--text-muted); }
.awaiting-panel .status-text { font-style: italic; font-weight: 600; }
.error-panel { background: rgba(220, 38, 38, 0.04); border-left-color: #dc2626; }
.error-panel .panel-header, .error-panel .status-text { color: #dc2626; }
.error-panel .status-text { font-family: ui-monospace, monospace; font-size: 0.72rem; }

@media (max-width: 1024px) { .split-layout { flex-direction: column; gap: 16px; } .right-col { min-height: 250px; } }
</style>