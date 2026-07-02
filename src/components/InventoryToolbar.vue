<template>
  <div class="toolbar-wrapper">
    <div class="sort-selector-group">
      <button :class="{ active: sortOrder === 'alphabetical' }" @click="emit('update:sortOrder', 'alphabetical')">A-Z ORDER</button>
      <button :class="{ active: sortOrder === 'highest_value' }" @click="emit('update:sortOrder', 'highest_value')">HIGHEST VALUE</button>
    </div>

    <div class="stats-grid-row">
      <div class="stat-pill overall" :class="{ active: activeCategoryFilter === 'all' }" @click="emitFilter('all')">
        <span class="label">OVERALL TOTAL VALUE</span>
        <span class="value">₱{{ overallTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-sky" :class="{ active: activeCategoryFilter === 'materials' }" @click="emitFilter('materials')">
        <span class="label">MATERIALS</span>
        <span class="value">₱{{ categoryTotals.materials.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-purple" :class="{ active: activeCategoryFilter === 'chemicals' }" @click="emitFilter('chemicals')">
        <span class="label">CHEMICALS</span>
        <span class="value">₱{{ categoryTotals.chemicals.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-yellow" :class="{ active: activeCategoryFilter === 'fertilizer' }" @click="emitFilter('fertilizer')" >
        <span class="label">FERTILIZER</span>
        <span class="value">₱{{ categoryTotals.fertilizer.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-red" :class="{ active: activeCategoryFilter === 'fuel_pol' }" @click="emitFilter('fuel_pol')">
        <span class="label">FUEL / POL</span>
        <span class="value">₱{{ categoryTotals.fuel_pol.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
    </div>
      
    <div class="export-action-group">
      <button class="btn-utility csv" @click="emit('export-csv')" title="Download Spreadsheet (.csv)">📥 RAW FILE</button>
      <button class="btn-utility print" @click="emit('trigger-print')" title="Open System Print Dialog">🖨️ PRINT</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeCategoryFilter: { type: String, required: true },
  overallTotalValue: { type: Number, default: 0 },
  categoryTotals: { type: Object, required: true },
  sortOrder: { type: String, required: true }
})
const emit = defineEmits(['update:categoryFilter', 'update:sortOrder', 'export-csv', 'trigger-print'])
const emitFilter = (category) => { emit('update:categoryFilter', category) }
</script>

<style scoped>
.toolbar-wrapper { display: flex; align-items: center; justify-content: space-between; gap: 24px; width: 100%; flex-shrink: 0; background: var(--bg-surface); padding: 12px 0; box-sizing: border-box; }
.stats-grid-row { display: flex; gap: 12px; flex: 1; padding: 0 24px; }
.stat-pill { background: #ffffff; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; flex: 1; display: flex; flex-direction: column; gap: 4px; cursor: pointer; transition: all 0.2s ease; color: #0f172a; text-align: left; }
.stat-pill .label { font-size: 0.58rem; font-weight: 800; letter-spacing: 0.05em; opacity: 0.6; transition: all 0.2s ease; }
.stat-pill .value { font-size: 1.15rem; font-weight: 800; font-family: ui-monospace, monospace; transition: all 0.2s ease; }
.stat-pill:hover .label, .stat-pill.active .label { opacity: 0.95; }
.stat-pill:hover, .stat-pill.active { color: #ffffff !important; }
.stat-pill.overall { background: #f0fdf4; border-color: #dcfce7; }
.stat-pill.theme-sky { background: #f0f9ff; border-color: #e0f2fe; }
.stat-pill.theme-purple { background: #faf5ff; border-color: #f3e8ff; }
.stat-pill.theme-yellow { background: #fffbeb; border-color: #fef3c7; }
.stat-pill.theme-red { background: #fef2f2; border-color: #fee2e2; }
.stat-pill.overall:hover, .stat-pill.overall.active { background: #059669; border-color: #059669; }
.stat-pill.theme-sky:hover, .stat-pill.theme-sky.active { background: #0284c7; border-color: #0284c7; }
.stat-pill.theme-purple:hover, .stat-pill.theme-purple.active { background: #7c3aed; border-color: #7c3aed; }
.stat-pill.theme-yellow:hover, .stat-pill.theme-yellow.active { background: #d97706; border-color: #d97706; }
.stat-pill.theme-red:hover, .stat-pill.theme-red.active { background: #dc2626; border-color: #dc2626; }
.sort-selector-group { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; padding-right: 4px; }
.export-action-group { display: flex; flex-direction: row; gap: 8px; align-items: center; padding-left: 4px; }
.sort-selector-group button { background: transparent; border: none; color: var(--text-muted); font-size: 0.65rem; font-weight: 800; padding: 2px 0; cursor: pointer; transition: all 0.15s ease; position: relative; letter-spacing: 0.03em; white-space: nowrap; text-align: left; }
.sort-selector-group button:hover { color: var(--text-main); transform: translateX(2px); }
.sort-selector-group button.active { color: #10b981; }
.btn-utility { background: var(--bg-surface); border: 1px solid var(--btn-border); color: var(--text-muted); font-size: 0.6rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; cursor: pointer; height: 24px; box-sizing: border-box; transition: all 0.15s ease; text-align: left; display: inline-flex; align-items: center; white-space: nowrap; }
.btn-utility:hover { color: #ffffff; border-color: transparent; transform: translateY(-0.5px); }
.btn-utility.csv:hover { background: #10b981; }
.btn-utility.print:hover { background: #3b82f6; }
</style>