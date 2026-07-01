<template>
  <div class="inventory-body-grid">
    <div class="inventory-list-panel">
      <div class="panel-header flex-header">
        
        <div class="filter-selector-group">
          <button :class="{ active: activeCategoryFilter === 'all' }" @click="emitFilter('all')">ALL</button>
          <button :class="{ active: activeCategoryFilter === 'materials' }" @click="emitFilter('materials')">MATERIALS</button>
          <button :class="{ active: activeCategoryFilter === 'chemicals' }" @click="emitFilter('chemicals')">CHEMICALS</button>
          <button :class="{ active: activeCategoryFilter === 'fertilizer' }" @click="emitFilter('fertilizer')">FERTILIZER</button>
          <button :class="{ active: activeCategoryFilter === 'fuel_pol' }" @click="emitFilter('fuel_pol')">FUEL / POL</button>
        </div>
        
        <div class="right-controls-wrapper">
          <div class="sort-selector-group">
            <button :class="{ active: activeSortOrder === 'alphabetical' }" @click="emitSort('alphabetical')">
              🔤 A-Z ORDER
            </button>
            <button :class="{ active: activeSortOrder === 'highest_value' }" @click="emitSort('highest_value')">
              💰 HIGHEST VALUE
            </button> 
          </div>
          
          <div class="export-action-group">
            <button class="btn-utility csv" @click="$emit('export-csv')" title="Download Spreadsheet">
              📥 DOWNLOAD
            </button>
            <button class="btn-utility print" @click="$emit('trigger-print')" title="Print Hardcopy Report">
              🖨️ PRINT
            </button>
          </div>
        </div>
      </div>
      
      <div class="table-scroll-frame">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>ITEM CODE</th>
              <th>DESCRIPTION</th>
              <th>CATEGORY</th>
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
                <span class="hover-search-hint">🔍 Info</span>
              </td>
              <td class="category-text-cell">{{ item.item_group }}</td>
              <td class="num font-mono">
                {{ item.available_stock.toLocaleString() }} 
                <small class="uom-text">{{ item.unit_of_measure }}</small>
              </td>
              <td class="num font-mono">₱{{ item.unit_cost.toFixed(2) }}</td>
              <td class="num font-mono highlight" :class="{ 'alt-highlight': activeSortOrder === 'highest_value' }">
                ₱{{ item.computed_total_value.toLocaleString(undefined, {minimumFractionDigits: 2}) }}
              </td>
            </tr>
            <tr v-if="isLoading">
              <td colspan="6" class="empty-msg loading">Streaming filtered asset logs for {{ areaContextName || 'selected block' }}...</td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="6" class="empty-msg">No active inventory assets found for this area.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="inventory-graph-panel">
      <InventoryDistributionChart :chart-data="chartData" />
    </div>
  </div>
</template>

<script setup>
import InventoryDistributionChart from './graphscharts/InventoryDistributionChart.vue'

defineProps({
  items: { type: Array, required: true },
  chartData: { type: Object, required: true },
  isLoading: { type: Boolean, default: false },
  activeCategoryFilter: { type: String, required: true },
  activeSortOrder: { type: String, required: true },
  areaContextName: { type: String, default: '' }
})

const emit = defineEmits(['update:categoryFilter', 'update:sortOrder', 'item-inspect', 'export-csv', 'trigger-print'])

const emitFilter = (category) => emit('update:categoryFilter', category)
const emitSort = (order) => emit('update:sortOrder', order)
</script>

<style scoped>
.inventory-body-grid { display: flex; gap: 16px; width: 100%; flex: 1; min-height: 0; }
.inventory-list-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; min-width: 0; height: 100%; overflow: hidden; }
.inventory-graph-panel { flex: 0 0 320px; max-width: 320px; min-width: 260px; width: 100%; height: 100%; }
.flex-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--border-color); background: var(--bg-surface); }
.right-controls-wrapper { display: flex; align-items: center; gap: 20px; }
.filter-selector-group, .sort-selector-group, .export-action-group { display: flex; gap: 16px; padding: 0 4px; }
.filter-selector-group button, .sort-selector-group button, .btn-utility { background: transparent; border: none; color: var(--text-muted); font-size: 0.65rem; font-weight: 800; padding: 4px 0; cursor: pointer; transition: color 0.15s ease; position: relative; letter-spacing: 0.03em; }
.filter-selector-group button:hover, .sort-selector-group button:hover, .btn-utility:hover { color: var(--text-main); }
.filter-selector-group button.active { color: #38bdf8; }
.filter-selector-group button.active::after { content: ''; position: absolute; bottom: -12px; left: 0; width: 100%; height: 2px; background: #38bdf8; }
.sort-selector-group button.active { color: #10b981; }
.sort-selector-group button.active::after { content: ''; position: absolute; bottom: -12px; left: 0; width: 100%; height: 2px; background: #10b981; }
.btn-utility.csv:hover { color: #10b981; }
.btn-utility.print:hover { color: #3b82f6; }

.table-scroll-frame { flex: 1; overflow-y: auto; padding: 0; min-height: 0; }
.inventory-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left; }
.inventory-table th { position: sticky; top: 0; background: var(--bg-surface); z-index: 10; padding: 8px 12px; font-weight: 800; color: var(--text-muted); border-bottom: 1px solid var(--border-color); font-size: 0.68rem; letter-spacing: 0.03em; }
.inventory-table td { padding: 6px 12px; border-bottom: 1px solid var(--border-color); color: var(--text-main); vertical-align: middle; height: 32px; box-sizing: border-box; }
.inventory-table tr:hover td { background: var(--btn-hover-bg); }
.inventory-table th.num, .inventory-table td.num { text-align: right; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.75rem; }

.code-text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; color: #0284c7; font-size: 0.72rem; }
:global(.dark-theme) .code-text { color: #38bdf8 !important; }

.category-text-cell { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.01em; }
.uom-text { color: var(--text-muted); font-size: 0.62rem; font-weight: 600; margin-left: 2px; }
.highlight { color: var(--text-main); font-weight: 700; } 
.highlight.alt-highlight { color: #10b981 !important; }
.empty-msg { text-align: center; color: var(--text-muted); padding: 32px !important; font-size: 0.75rem; font-weight: 600; } 
.empty-msg.loading { color: #38bdf8; }

.interactive-name-cell { cursor: pointer; position: relative; font-weight: 600; padding-right: 40px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }
.interactive-name-cell:hover { color: #38bdf8; text-decoration: underline; }
.hover-search-hint { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 0.58rem; font-weight: 800; color: #ffffff; background: #38bdf8; padding: 1px 4px; border-radius: 3px; opacity: 0; pointer-events: none; transition: opacity 0.1s ease; text-decoration: none !important; }
.inventory-table tr:hover .hover-search-hint { opacity: 1; }
</style>