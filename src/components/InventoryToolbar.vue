<template>
  <div class="stats-grid-row">
    <div 
      class="stat-pill overall" 
      :class="{ active: activeCategoryFilter === 'all' }" 
      @click="emitFilter('all')"
    >
      <span class="label theme-emerald">OVERALL TOTAL VALUE</span>
      <span class="value theme-emerald">₱{{ overallTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    
    <div 
      class="stat-pill" 
      :class="{ active: activeCategoryFilter === 'materials' }" 
      @click="emitFilter('materials')"
    >
      <span class="label theme-sky">MATERIALS</span>
      <span class="value theme-sky">₱{{ categoryTotals.materials.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    
    <div 
      class="stat-pill" 
      :class="{ active: activeCategoryFilter === 'chemicals' }" 
      @click="emitFilter('chemicals')"
    >
      <span class="label theme-purple">CHEMICALS</span>
      <span class="value theme-purple">₱{{ categoryTotals.chemicals.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    
    <div 
      class="stat-pill" 
      :class="{ active: activeCategoryFilter === 'fertilizer' }" 
      @click="emitFilter('fertilizer')"
    >
      <span class="label theme-yellow">FERTILIZER</span>
      <span class="value theme-yellow">₱{{ categoryTotals.fertilizer.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    
    <div 
      class="stat-pill" 
      :class="{ active: activeCategoryFilter === 'fuel_pol' }" 
      @click="emitFilter('fuel_pol')"
    >
      <span class="label theme-red">FUEL / POL</span>
      <span class="value theme-red">₱{{ categoryTotals.fuel_pol.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeCategoryFilter: { type: String, required: true },
  overallTotalValue: { type: Number, default: 0 },
  categoryTotals: { type: Object, required: true }
})

const emit = defineEmits(['update:categoryFilter'])

const emitFilter = (category) => {
  emit('update:categoryFilter', category)
}
</script>

<style scoped>
.stats-grid-row { display: flex; gap: 12px; width: 100%; flex-shrink: 0; }
.stat-pill { background: var(--bg-surface); border: 1px solid var(--border-color); padding: 8px 14px; border-radius: 8px; flex: 1; display: flex; flex-direction: column; gap: 2px; cursor: pointer; transition: all 0.2s ease; }

/* Existing pill states */
.stat-pill:hover { background: var(--btn-hover-bg); border-color: var(--border-color); }
.stat-pill.active { border-color: #38bdf8; background: var(--btn-hover-bg); }
.stat-pill.overall.active { border-color: #10b981; }

/* Base text styles with transitions ready */
.stat-pill .label { font-size: 0.58rem; font-weight: 800; letter-spacing: 0.05em; transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease; }
.stat-pill .value { font-size: 1.15rem; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; transition: transform 0.2s ease, filter 0.2s ease; }

/* 🌟 Simple Hover Effect: Text shifts up slightly and pops in contrast */
.stat-pill:hover .label { opacity: 0.85; transform: translateY(-1px); }
.stat-pill:hover .value { transform: translateY(-1px); filter: brightness(1.2); }

/* In dark mode, we dim down the brightness slightly on hover instead of over-exposure */
:global(.dark-theme) .stat-pill:hover .value { filter: brightness(1.3); }

/* --- Theme Color Classes applied to both Labels and Values --- */
.theme-emerald { color: #059669; }
:global(.dark-theme) .theme-emerald { color: #34d399 !important; }

.theme-sky { color: #0284c7; } 
:global(.dark-theme) .theme-sky { color: #38bdf8 !important; }

.theme-purple { color: #7c3aed; } 
:global(.dark-theme) .theme-purple { color: #a78bfa !important; }

.theme-yellow { color: #d97706; } 
:global(.dark-theme) .theme-yellow { color: #fbbf24 !important; }

.theme-red { color: #dc2626; }
:global(.dark-theme) .theme-red { color: #f87171 !important; }


</style>