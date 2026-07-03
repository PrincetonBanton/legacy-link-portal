<template>
  <div class="toolbar-wrapper">
    <div class="controls-action-row">
      <div class="left-controls-group">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            placeholder="🔍 Search inventory..." 
            @input="emit('update:searchQuery', $event.target.value)"
          />
        </div>

        <div class="sort-selector-group">
          <button :class="{ active: sortOrder === 'highest_value' }" @click="emit('update:sortOrder', 'highest_value')">💰 HIGHEST VALUE</button>
          <button :class="{ active: sortOrder === 'alphabetical' }" @click="emit('update:sortOrder', 'alphabetical')">🔤 A-Z ORDER</button>
        </div>
      </div>
        
      <div class="export-action-group">
        <button class="btn-utility csv" @click="emit('export-csv')" title="Download Spreadsheet (.csv)">📥 RAW FILE</button>
        <button class="btn-utility print" @click="emit('trigger-print')" title="Open System Print Dialog">🖨️ PRINT</button>
      </div>
    </div>

    <div class="stats-grid-row">
      <div class="stat-pill overall" :class="{ active: activeCategoryFilter === 'all' }" @click="emit('update:categoryFilter', 'all')">
        <span class="label">OVERALL TOTAL VALUE</span>
        <span class="value text-red">₱{{ overallTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-sky" :class="{ active: activeCategoryFilter === 'materials' }" @click="emit('update:categoryFilter', 'materials')">
        <span class="label">MATERIALS</span>
        <span class="value">₱{{ categoryTotals.materials?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-purple" :class="{ active: activeCategoryFilter === 'chemicals' }" @click="emit('update:categoryFilter', 'chemicals')">
        <span class="label">CHEMICALS</span>
        <span class="value">₱{{ categoryTotals.chemicals?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-yellow" :class="{ active: activeCategoryFilter === 'fertilizer' }" @click="emit('update:categoryFilter', 'fertilizer')" >
        <span class="label">FERTILIZER</span>
        <span class="value">₱{{ categoryTotals.fertilizer?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
      <div class="stat-pill theme-red" :class="{ active: activeCategoryFilter === 'fuel_pol' }" @click="emit('update:categoryFilter', 'fuel_pol')">
        <span class="label">FUEL / POL</span>
        <span class="value">₱{{ categoryTotals.fuel_pol?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>
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

// Declared global macro constant so the template can intercept inline click hooks cleanly
const emit = defineEmits(['update:categoryFilter', 'update:sortOrder', 'update:searchQuery', 'export-csv', 'trigger-print'])
</script>

<style scoped>
.toolbar-wrapper { display: flex; flex-direction: column; gap: 16px; width: 100%; flex-shrink: 0; background: var(--bg-surface); padding: 12px 0; box-sizing: border-box; }
.controls-action-row { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 24px; }
.left-controls-group { display: flex; align-items: center; gap: 16px; flex: 1; }
.stats-grid-row { display: flex; gap: 12px; width: 100%; box-sizing: border-box; }

.search-input-wrapper { width: 100%; max-width: 240px; }
.search-input-wrapper input { width: 100%; height: 28px; padding: 4px 10px; border: 1px solid var(--btn-border, #cbd5e1); border-radius: 6px; background: var(--bg-surface); color: var(--text-main); font-size: 0.72rem; font-weight: 600; box-sizing: border-box; transition: all 0.15s ease; }
.search-input-wrapper input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2); }

.sort-selector-group { display: flex; flex-direction: row; gap: 4px; align-items: center; background: #f1f5f9; padding: 3px; border-radius: 6px; border: 1px solid #e2e8f0; }
.sort-selector-group button { background: transparent; border: none; color: #64748b; font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; letter-spacing: 0.03em; white-space: nowrap; }
.sort-selector-group button:hover { color: #0f172a; }
.sort-selector-group button.active { background: #ffffff; color: #10b981; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }

.export-action-group { display: flex; flex-direction: row; gap: 8px; align-items: center; }
.btn-utility { background: var(--bg-surface); border: 1px solid var(--btn-border, #cbd5e1); color: #64748b; font-size: 0.62rem; font-weight: 800; padding: 0 12px; border-radius: 6px; cursor: pointer; height: 28px; box-sizing: border-box; transition: all 0.15s ease; text-align: left; display: inline-flex; align-items: center; white-space: nowrap; }
.btn-utility:hover { color: #ffffff; border-color: transparent; transform: translateY(-0.5px); box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
.btn-utility.csv:hover { background: #10b981; }
.btn-utility.print:hover { background: #3b82f6; }

.stat-pill { background: #ffffff; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; flex: 1; display: flex; flex-direction: column; gap: 4px; cursor: pointer; transition: all 0.2s ease; color: #0f172a; text-align: left; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02); }
.stat-pill .label { font-size: 0.58rem; font-weight: 800; letter-spacing: 0.05em; opacity: 0.6; transition: all 0.2s ease; }
.stat-pill .value { font-size: 1.15rem; font-weight: 800; font-family: ui-monospace, monospace; transition: all 0.2s ease; }
.stat-pill .value.text-red { color: #dc2626; }

.stat-pill.overall { background: #f0fdf4; border-color: #dcfce7; }
.stat-pill.theme-sky { background: #f0f9ff; border-color: #e0f2fe; }
.stat-pill.theme-purple { background: #faf5ff; border-color: #f3e8ff; }
.stat-pill.theme-yellow { background: #fffbeb; border-color: #fef3c7; }
.stat-pill.theme-red { background: #fef2f2; border-color: #fee2e2; }

.stat-pill.overall:hover, .stat-pill.overall.active { background: #059669 !important; border-color: #059669 !important; color: #ffffff !important; }
.stat-pill.theme-sky:hover, .stat-pill.theme-sky.active { background: #0284c7 !important; border-color: #0284c7 !important; color: #ffffff !important; }
.stat-pill.theme-purple:hover, .stat-pill.theme-purple.active { background: #7c3aed !important; border-color: #7c3aed !important; color: #ffffff !important; }
.stat-pill.theme-yellow:hover, .stat-pill.theme-yellow.active { background: #d97706 !important; border-color: #d97706 !important; color: #ffffff !important; }
.stat-pill.theme-red:hover, .stat-pill.theme-red.active { background: #dc2626 !important; border-color: #dc2626 !important; color: #ffffff !important; }

/* Content Typography Shifts */
.stat-pill:hover .label, .stat-pill.active .label { opacity: 0.95; color: #ffffff !important; }
.stat-pill:hover .value, .stat-pill.active .value { color: #ffffff !important; }
</style>