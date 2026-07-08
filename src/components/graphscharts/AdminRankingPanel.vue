<template>
  <div class="visual-card ranking-panel">
    <div class="card-header">
      Top Segment Financial Performance
    </div>
    <div class="ranking-table-wrapper">
      <table class="static-ranking-table">
        <tbody>
          <tr v-for="block in sortedMetrics" :key="block.identifier" class="ranking-row">
            <td align="left" class="cell-identifier">
              {{ block.identifier }} 
              <span v-if="block.owner" class="owner-text">({{ block.owner }})</span>
            </td>
            <td align="right" class="cell-value">
              {{ (block.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </td>
          </tr>
          <tr v-if="sortedMetrics.length === 0" class="empty-row-placeholder">
            <td colspan="2">No segment metrics deployed inside active viewport.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  metricsData: { type: Array, required: true, default: () => [] }
})

const sortedMetrics = computed(() => {
  return [...props.metricsData].sort((a, b) => (b.value || 0) - (a.value || 0))
})
</script>

<style scoped>
.visual-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; display: flex; flex-direction: column; overflow: hidden; transition: background .25s ease, border-color .25s ease; }
.ranking-panel { height: 100%; min-height: 0; }
.card-header { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; background: var(--bg-nav); padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--border-color); text-align: left; letter-spacing: 0.02em; transition: background .25s ease, border-color .25s ease, color .25s ease; }
.static-ranking-table { width: 100%; border-collapse: collapse; font-size: 0.76rem; line-height: 1.2; }
.ranking-row { transition: background-color .2s ease; }
.ranking-row:hover { background-color: var(--btn-hover-bg); }
.cell-identifier { padding: 0.2rem 0.5rem; color: var(--text-main); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; transition: color .25s ease; }
.owner-text { color: var(--text-muted); font-size: 0.72rem; transition: color .25s ease; }
.cell-value { padding: 0.2rem 0.5rem; color: #10b981; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; }
.empty-row-placeholder td { padding: 2rem 1rem; color: var(--text-muted); text-align: center; font-style: italic; transition: color .25s ease; }

.ranking-table-wrapper { 
  flex: 1; 
  overflow-y: auto;          /* Keeps it scrollable on screen */
  max-height: 280px;         /* Caps the element vertical height */
  background: var(--bg-main); 
  transition: background .25s ease; 
}
/* Clean print layout instructions for html2pdf page compilation */
@media print {
  .ranking-table-wrapper {
    max-height: 280px !important;
    overflow: hidden !important; /* Seamlessly cuts off trailing rows cleanly without a raw scrollbar visible in the PDF */
  }
}
</style>  