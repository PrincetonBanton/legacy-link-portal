<template>
  <table class="inventory-table">
    <thead>
      <tr>
        <th>CODE</th>
        <th>ITEM</th>
        <th>GROUP</th>
        <th class="num">STOCK</th>
        <th class="num">UNIT COST</th>
        <th class="num">TOTAL VALUE</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td class="code-text">{{ item.item_code }}</td>
        <td class="interactive-name-cell" @click="$emit('item-inspect', item)">
          {{ item.item_name }}
        </td>
        <td class="category-text-cell">{{ item.item_group }}</td>
        <td class="num font-mono">
          {{ item.available_stock.toLocaleString() }} 
          <small class="uom-text">{{ item.unit_of_measure }}</small>
        </td>
        <td class="num font-mono">{{ item.unit_cost.toFixed(2) }}</td>
        
        <td class="num font-mono text-red">
          {{ item.computed_total_value.toLocaleString(undefined, {minimumFractionDigits: 2}) }}
        </td>
      </tr>
      <tr v-if="isLoading">
        <td colspan="6" class="empty-msg loading">Streaming filtered asset logs...</td>
      </tr>
      <tr v-else-if="!items.length">
        <td colspan="6" class="empty-msg">No active inventory assets found for this area.</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  sortOrder: { type: String, required: true }
})

defineEmits(['item-inspect'])
</script>

<style scoped>
/* 🖥️ COMPACT SCREEN MODE STYLES */
.inventory-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left; }
.inventory-table th { top: 0; background: var(--bg-surface); z-index: 10; padding: 6px 8px; font-weight: 800; color: var(--text-muted); border-bottom: 1px solid var(--border-color); font-size: 0.68rem; letter-spacing: 0.03em; }
.inventory-table td { padding: 6px 8px; border-bottom: 1px solid var(--border-color); color: var(--text-main); vertical-align: middle; height: 32px; box-sizing: border-box; }
.inventory-table tr:hover td { background: var(--btn-hover-bg); }
.inventory-table th.num, .inventory-table td.num { text-align: right; }
.font-mono, .code-text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.75rem; }
.code-text { font-weight: 700; color: #0284c7; font-size: 0.72rem; }
.category-text-cell { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.01em; }
.uom-text { color: var(--text-muted); font-size: 0.62rem; font-weight: 600; margin-left: 2px; }
.text-red { color: #dc2626 !important; font-weight: 700; }
.empty-msg { text-align: center; color: var(--text-muted); padding: 32px !important; font-size: 0.75rem; font-weight: 600; } 
.empty-msg.loading { color: #38bdf8; }
.interactive-name-cell { cursor: pointer; position: relative; font-weight: 600; padding-right: 40px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }
.interactive-name-cell:hover { color: #38bdf8; text-decoration: underline; }

/* TARGETS THE HTML2PDF SNAPSHOT GENERATOR DIRECTLY */
:global(.html2pdf__container) .inventory-table td,
:global(.html2pdf__container) .inventory-table td.font-mono,
:global(.html2pdf__container) .inventory-table td.code-text,
:global(.html2pdf__container) .inventory-table td.category-text-cell,
:global(.html2pdf__container) .inventory-table td.interactive-name-cell {
  padding: 3px 4px !important;    
  font-size: 0.58rem !important;  
  line-height: 1.0 !important;    
  height: auto !important;        
  font-family: "Arial Narrow", "Helvetica Neue Condensed", "Segoe UI Condensed", sans-serif !important;
  letter-spacing: -0.02em !important;
}

</style>