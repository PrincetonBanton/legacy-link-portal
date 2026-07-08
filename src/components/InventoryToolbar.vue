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
        <button class="btn-utility print" @click="emit('trigger-print')" title="Open System PDF Engine">🖨️ PRINT</button>  
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sortOrder: { type: String, required: true }
})
const emit = defineEmits(['update:sortOrder', 'update:searchQuery', 'export-csv', 'trigger-print'])
</script>

<style scoped>
.toolbar-wrapper { display: flex; flex-direction: column; gap: 16px; width: 100%; flex-shrink: 0; background: var(--bg-surface); padding: 12px 0; box-sizing: border-box; }
.controls-action-row { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 24px; }
.left-controls-group { display: flex; align-items: center; gap: 16px; flex: 1; }
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
</style>