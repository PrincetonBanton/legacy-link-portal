<template>
  <div class="stats-grid-row">
    <div 
      class="stat-pill overall" 
      :class="{ active: activeCategoryFilter === 'all' }" 
      @click="emit('update:categoryFilter', 'all')"
    >
      <span class="label">OVERALL TOTAL VALUE</span>
      <span class="value text-red">₱{{ overallTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    <div 
      class="stat-pill theme-sky" 
      :class="{ active: activeCategoryFilter === 'materials' }" 
      @click="emit('update:categoryFilter', 'materials')"
    >
      <span class="label">MATERIALS</span>
      <span class="value">₱{{ categoryTotals.materials?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    <div 
      class="stat-pill theme-purple" 
      :class="{ active: activeCategoryFilter === 'chemicals' }" 
      @click="emit('update:categoryFilter', 'chemicals')"
    >
      <span class="label">CHEMICALS</span>
      <span class="value">₱{{ categoryTotals.chemicals?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    <div 
      class="stat-pill theme-yellow" 
      :class="{ active: activeCategoryFilter === 'fertilizer' }" 
      @click="emit('update:categoryFilter', 'fertilizer')"
    >
      <span class="label">FERTILIZER</span>
      <span class="value">₱{{ categoryTotals.fertilizer?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
    </div>
    <div 
      class="stat-pill theme-red" 
      :class="{ active: activeCategoryFilter === 'fuel_pol' }" 
      @click="emit('update:categoryFilter', 'fuel_pol')"
    >
      <span class="label">FUEL / POL</span>
      <span class="value">₱{{ categoryTotals.fuel_pol?.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
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
</script>

<style scoped>
.stats-grid-row { display: flex; gap: 12px; width: 100%; box-sizing: border-box; }
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
.stat-pill:hover .label, .stat-pill.active .label { opacity: 0.95; color: #ffffff !important; }
.stat-pill:hover .value, .stat-pill.active .value { color: #ffffff !important; }
</style>