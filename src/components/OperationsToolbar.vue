<template>
  <div class="workspace-toolbar">
    <div class="toolbar-meta">
      <div class="date-range-filter">
        <div class="input-field">
          <label>Start:</label>
          <input type="date" v-model="filterMinDate" @change="emitViewportChange" class="toolbar-date-input" />
        </div>
        <div class="input-field">
          <label>End:</label>
          <input type="date" v-model="filterMaxDate" @change="emitViewportChange" class="toolbar-date-input" />
        </div>
      </div>

      <div class="metric-summary-box">
        <div class="metric-lbl">RANGE TOTAL</div>
        <div class="metric-val text-green">{{ formattedRangeTotal }}</div>
      </div>
    </div>
    
    <div class="toolbar-actions-wrapper">
      <div class="export-action-group">
        <button class="btn-utility csv" @click="$emit('export-csv')" title="Download Spreadsheet (.csv)">📥 RAW FILE</button>
        <button class="btn-utility print" @click="$emit('trigger-print')" title="Open System Print Dialog">🖨️ PRINT</button>
      </div>
      
      <button class="refresh-icon-btn" @click="$emit('refresh')" title="Refresh Segment Pipeline">🔄</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  activeSelection: { type: Object, required: true },
  dailyTrends: { type: Array, required: true }
})

const emit = defineEmits(['refresh', 'update-viewport', 'export-csv', 'trigger-print'])

const filterMinDate = ref('')
const filterMaxDate = ref('')

watch(() => props.activeSelection, (newVal) => {
  if (newVal) {
    filterMinDate.value = newVal.isoMinDate
    filterMaxDate.value = newVal.isoMaxDate
  }
}, { immediate: true })

const emitViewportChange = () => {
  emit('update-viewport', { minDate: filterMinDate.value, maxDate: filterMaxDate.value })
}

const formattedRangeTotal = computed(() => {
  const sum = props.dailyTrends.reduce((acc, row) => acc + parseFloat(row.total_financial_value || 0), 0)
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(sum)
})
</script>

<style scoped>
.workspace-toolbar { display: flex; justify-content: space-between; align-items: center; background: var(--bg-nav); padding: 0.4rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; flex-shrink: 0; min-height: 44px; box-sizing: border-box; transition: background .25s ease, border-color .25s ease; }
.toolbar-meta { display: flex; flex-direction: row; align-items: center; gap: 2rem; text-align: left; }
.date-range-filter { display: flex; gap: 0.75rem; align-items: center; }
.input-field { display: flex; flex-direction: row; align-items: center; gap: 6px; }
.input-field label { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; transition: color .25s ease; }
.toolbar-date-input { border: 1px solid var(--btn-border); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: var(--text-main); background: var(--bg-main); height: 24px; box-sizing: border-box; transition: all .25s ease; }
.toolbar-date-input:focus { border-color: #3b82f6; outline: none; }
:global(.dark-theme) .toolbar-date-input { color-scheme: dark; } :global(.light-theme) .toolbar-date-input { color-scheme: light; }

/* Right actions alignment structural container */
.toolbar-actions-wrapper { display: flex; align-items: center; gap: 0.75rem; }
.export-action-group { display: flex; gap: 4px; align-items: center; }
.btn-utility { background: var(--bg-surface); border: 1px solid var(--btn-border); color: var(--text-muted); font-size: 0.6rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; cursor: pointer; height: 24px; box-sizing: border-box; transition: all 0.15s ease; }
.btn-utility:hover { color: #ffffff; border-color: transparent; }
.btn-utility.csv:hover { background: #10b981; }
.btn-utility.print:hover { background: #3b82f6; }

.metric-summary-box { display: flex; flex-direction: row; align-items: center; gap: 8px; border-left: 1px solid var(--border-color); padding-left: 1.5rem; height: 20px; }
.metric-lbl { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; white-space: nowrap; transition: color .25s ease; }
.metric-val { font-size: 1.05rem; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: nowrap; }
.text-green { color: #10b981; }

.refresh-icon-btn { background: var(--bg-surface); border: 1px solid var(--btn-border); color: var(--text-main); font-size: 0.8rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; transition: all 0.2s ease; box-sizing: border-box; }
.refresh-icon-btn:hover { background: var(--btn-hover-bg); border-color: #3b82f6; transform: scale(1.02); color: #38bdf8; }
</style>