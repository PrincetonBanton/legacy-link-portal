<template>
  <table class="analytics-table">
    <thead>
      <tr v-if="activeDatasetType === 'trends'">
        <th>TREND DATE</th>
        <th class="num">INVOICE COUNT</th>
        <th class="num">TOTAL FINANCIAL VALUE</th>
      </tr>
      <tr v-else-if="activeDatasetType === 'blocks'">
        <th>BLOCK IDENTIFIER</th>
        <th class="num">TOTAL VALUE</th>
      </tr>
      <tr v-else-if="activeDatasetType === 'products'">
        <th>PRODUCT VARIANT CODE</th>
        <th class="num">AGGREGATED VALUE</th>
      </tr>
      <tr v-else-if="activeDatasetType === 'groups'">
        <th>LOGISTICAL GROUP CLASS</th>
        <th class="num">AGGREGATED VALUE</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!rows || rows.length === 0">
        <td :colspan="activeDatasetType === 'trends' ? 3 : 2" class="empty-msg">
          No active analytics records found for this pipeline node.
        </td>
      </tr>
      <template v-else>
        <tr v-if="activeDatasetType === 'trends'" v-for="(row, index) in rows" :key="'trend-' + index">
          <td class="interactive-name-cell">{{ row.trend_date }}</td>
          <td class="num font-mono">{{ Number(row.invoice_count || 0).toLocaleString() }}</td>
          <td class="num font-mono text-red">₱{{ Number(row.total_financial_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
        </tr>
        <tr v-if="activeDatasetType === 'blocks'" v-for="(row, index) in rows" :key="'block-' + index">
          <td class="code-text">{{ row.identifier }}</td>
          <td class="num font-mono text-red">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
        </tr>
        <tr v-if="activeDatasetType === 'products'" v-for="(row, index) in rows" :key="'prod-' + index">
          <td class="interactive-name-cell">{{ row.identifier || 'Unknown Product' }}</td>
          <td class="num font-mono text-red">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
        </tr>
        <tr v-if="activeDatasetType === 'groups'" v-for="(row, index) in rows" :key="'grp-' + index">
          <td class="category-text-cell">{{ row.group_name || row.identifier || 'Unknown Group' }}</td>
          <td class="num font-mono text-red">₱{{ Number(row.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  activeDatasetType: { type: String, required: true },
  rows: { type: Array, default: () => [] }
})
</script>

<style scoped>
/* 🖥️ SCREEN */
.analytics-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left; }
.analytics-table th { position: sticky; top: 0; background: var(--bg-surface, #f8fafc); z-index: 10; padding: 8px 12px; font-weight: 800; color: var(--text-muted, #64748b); border-bottom: 1px solid var(--border-color, #edf2f7); font-size: 0.68rem; letter-spacing: 0.03em; }
.analytics-table td { padding: 6px 12px; border-bottom: 1px solid var(--border-color, #f1f5f9); color: var(--text-main, #334155); vertical-align: middle; height: 32px; box-sizing: border-box; }
.analytics-table tr:hover td { background: var(--btn-hover-bg, #f8fafc); }
.analytics-table th.num, .analytics-table td.num { text-align: right; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.75rem; }
.code-text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; color: #0284c7; font-size: 0.72rem; }
.category-text-cell { font-size: 0.72rem; font-weight: 600; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.01em; }
.text-red { color: #dc2626 !important; font-weight: 700; }
.empty-msg { text-align: center; color: var(--text-muted, #94a3b8); padding: 32px !important; font-size: 0.75rem; font-weight: 600; font-style: italic; } 
.interactive-name-cell { font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }

/* 🖨️ PRINT */
:global(.html2pdf__container) .analytics-table { overflow: visible !important; height: auto !important; }
:global(.html2pdf__container) .analytics-table th { position: static !important; }
:global(.html2pdf__container) .analytics-table td, :global(.html2pdf__container) .analytics-table td.font-mono, :global(.html2pdf__container) .analytics-table td.code-text, :global(.html2pdf__container) .analytics-table td.category-text-cell, :global(.html2pdf__container) .analytics-table td.interactive-name-cell { padding: 3px 4px !important; font-size: 0.58rem !important; line-height: 1.0 !important; height: auto !important; font-family: "Arial Narrow", "Helvetica Neue Condensed", sans-serif !important; letter-spacing: -0.02em !important; }
</style>