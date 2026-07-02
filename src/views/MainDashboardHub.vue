<template>
  <div class="app-container">
    <nav class="app-nav-bar">
      <div class="nav-brand-group">
        <img 
          src="/sodaco.png" 
          class="dashboard-logo interactive-logo" 
          alt="Sodaco Logo" 
          @click="goHome"
          title="Return to Dashboard Home"
        />
        
        <div class="nav-context-dropdowns">
          <div class="select-wrapper">
            <select 
              :value="activeDashboardArea?.area" 
              @change="handleAreaDropdownChange"
              class="context-select area-select"
            >
              <option value="" disabled selected hidden>SELECT AREA...</option>
              <option v-for="group in nestedSegments" :key="group.area" :value="group.area">
                {{ group.area }}
              </option>
            </select>
          </div>

          <div class="select-wrapper">
            <select 
              :value="activeDashboardArea?.systemType" 
              @change="handleSystemDropdownChange"
              :disabled="!activeDashboardArea?.area || !availableSystems.length"
              class="context-select profile-select"
            >
              <option value="" disabled selected hidden>SELECT DATA...</option>
              <option 
                v-for="sys in availableSystems" 
                :key="sys.systemType" 
                :value="sys.systemType"
                :disabled="sys.notAvailable"
              >
                📊 {{ sys.displayName }} {{ sys.notAvailable ? '(N/A)' : '' }}
              </option>
            </select>
          </div>
        </div>

        <div class="status-badge connected">
          <span class="pulse-dot"></span> Live Portal Link Active
        </div>
      </div>

      <div class="nav-controls">
        <button :class="{ active: currentView === 'operations' }" @click="currentView = 'operations'">DASHBOARD</button>        
        <button :class="{ active: currentView === 'inventory' }" @click="handleInventoryClick">INVENTORY</button>
        <button :class="{ active: currentView === 'analytics' }" @click="handleAnalyticsClick">ANALYTICS</button>
        
        <span class="nav-divider"></span>
        <button class="theme-toggle-btn" @click="themeCtx.toggleTheme()" :title="themeCtx.isDarkMode.value ? 'Switch to Light' : 'Switch to Dark'">
          <span class="theme-icon">{{ themeCtx.isDarkMode.value ? '☀️' : '🌙' }}</span>
        </button>

        <button class="signout-btn" @click="emit('sign-out')">SIGN OUT</button>
      </div>
    </nav>

    <div class="view-viewport">
      <KeepAlive>
        <component 
          :is="views[currentView]" 
          :selected-context="activeDashboardArea"
          @area-changed="updateActiveAreaContext"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, watch } from 'vue'
import { useOwnerAnalysis } from '../composables/useOwnerAnalysis.js'
import { transformGroupedSummaryToSegments } from '../utils/dataTransformers.js'
import { convertToISODate } from '../utils/dateUtils.js'
import OperationsView from './OperationsView.vue'
import InventoryView from './InventoryView.vue'
import AnalyticsView from './AnalyticsView.vue'

const emit = defineEmits(['sign-out'])
const themeCtx = inject('theme')
const { 
  groupedSummary, 
  loadEnterpriseData,
  fetchTrends,
  fetchBlockAggregations,
  fetchProductAggregations,
  fetchGroupAggregations
} = useOwnerAnalysis()

const currentView = ref('operations')
const activeDashboardArea = ref(null)

const views = { 
  operations: OperationsView, 
  inventory: InventoryView,
  analytics: AnalyticsView 
}

onMounted(() => { 
  loadEnterpriseData() 
})

watch(activeDashboardArea, (newContext) => {
  if (!newContext || currentView.value !== 'analytics') return
  triggerMetricsPipeline(newContext)
}, { deep: true })

const nestedSegments = computed(() => transformGroupedSummaryToSegments(groupedSummary.value))

const availableSystems = computed(() => {
  const selectedAreaName = activeDashboardArea.value?.area
  if (!selectedAreaName) return []
  return nestedSegments.value.find(group => group.area === selectedAreaName)?.systems || []
})

const updateActiveAreaContext = (payload) => { 
  activeDashboardArea.value = payload 
}

const handleAreaDropdownChange = (event) => {
  const selectedArea = event.target.value
  const targetGroup = nestedSegments.value.find(group => group.area === selectedArea)
  if (!targetGroup) return

  const firstAvailableSystem = targetGroup.systems.find(sys => !sys.notAvailable) || targetGroup.systems[0]
  if (!firstAvailableSystem) return

  activeDashboardArea.value = {
    area: selectedArea,
    systemType: firstAvailableSystem.systemType,
    minDate: firstAvailableSystem.minDate,
    maxDate: firstAvailableSystem.maxDate,
    isoMinDate: convertToISODate(firstAvailableSystem.minDate), 
    isoMaxDate: convertToISODate(firstAvailableSystem.maxDate)
  }
}

const handleSystemDropdownChange = (event) => {
  if (!activeDashboardArea.value) return
  const selectedSysType = event.target.value
  const currentSysConfig = availableSystems.value.find(sys => sys.systemType === selectedSysType)
  if (!currentSysConfig || currentSysConfig.notAvailable) return

  activeDashboardArea.value = {
    ...activeDashboardArea.value,
    systemType: selectedSysType,
    minDate: currentSysConfig.minDate,
    maxDate: currentSysConfig.maxDate,
    isoMinDate: convertToISODate(currentSysConfig.minDate), 
    isoMaxDate: convertToISODate(currentSysConfig.maxDate)
  }
}

const goHome = () => { 
  currentView.value = 'operations' 
}

const handleInventoryClick = () => {
  if (!activeDashboardArea.value?.area) {
    alert("⚠️ No enterprise area chosen yet! Please pick an active location from the workspace dropdown picker menu layout above.")
    return
  }
  currentView.value = 'inventory'
}

const handleAnalyticsClick = async () => {
  if (!activeDashboardArea.value?.area) {
    alert("⚠️ No enterprise area chosen yet! Please pick an active location from the workspace dropdown picker menu layout above.")
    return
  }
  currentView.value = 'analytics'
}

const triggerMetricsPipeline = (context) => {
  const { area, systemType, isoMinDate, isoMaxDate } = context
  fetchTrends(area, systemType, isoMinDate, isoMaxDate)
  fetchBlockAggregations(area, systemType, isoMinDate, isoMaxDate)
  if (systemType === 'Production System') {
    fetchProductAggregations(area, systemType, isoMinDate, isoMaxDate)
  } else {
    fetchGroupAggregations(area, systemType, isoMinDate, isoMaxDate)
  }
}
</script>

<style scoped>
.app-container { display: flex; flex-direction: column; width: 100vw; height: 100vh; overflow: hidden; background: var(--bg-main); transition: background .2s; }
.app-nav-bar { display: flex; justify-content: space-between; align-items: center; padding: .5rem 1.5rem; background: var(--bg-nav); border-bottom: 1px solid var(--border-color); flex-shrink: 0; transition: background .2s, border-color .2s; }
.nav-brand-group, .nav-context-dropdowns, .nav-controls { display: flex; align-items: center; gap: 16px; }
.nav-context-dropdowns { gap: 10px; }
.nav-controls { gap: 12px; }
.view-viewport { flex: 1; min-height: 0; width: 100%; }
.select-wrapper { position: relative; display: inline-flex; align-items: center; width: 210px; }
.select-wrapper::after { content: '▼'; font-size: 8px; color: var(--text-muted, #777); position: absolute; right: 12px; pointer-events: none; }
.context-select { width: 100%; background: var(--bg-surface, #fff); color: var(--text-main, #0f172a); border: 1px solid var(--border-color, #e2e8f0); padding: 6px 32px 6px 12px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; cursor: pointer; outline: none; appearance: none; transition: border-color .15s, background-color .15s, color .15s; }
.context-select:hover:not(:disabled) { border-color: #38bdf8; }
.context-select:disabled { opacity: 0.4; cursor: not-allowed; }
.dashboard-logo { width: 38px; height: 38px; border-radius: 50%; cursor: pointer; transition: transform .15s; }
.dashboard-logo:hover { transform: scale(1.04); }
.dashboard-logo:active { transform: scale(.98); }
.status-badge { display: flex; align-items: center; gap: 6px; color: #34d399; font-size: 10px; font-weight: 700; background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.15); padding: 4px 10px; border-radius: 20px; }
.pulse-dot { width: 6px; height: 6px; background: #34d399; border-radius: 50%; animation: glow 1.5s infinite; }
.nav-divider { width: 1px; height: 16px; background: var(--border-color); }
.nav-controls button, .theme-toggle-btn { background: transparent; border: 1px solid var(--btn-border); color: var(--text-muted); font-size: .7rem; font-weight: 700; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: all .2s; }
.nav-controls button:hover:not(:disabled), .theme-toggle-btn:hover { color: #10b981; border-color: #10b981; background: var(--btn-hover-bg); box-shadow: 0 0 6px rgba(16, 185, 129, 0.15); }
.nav-controls button.active { background: var(--btn-hover-bg); color: var(--accent); border-color: var(--accent); box-shadow: 0 0 8px var(--accent-bg); }
.signout-btn { border-color: #ef4444 !important; color: #ef4444 !important; }
.signout-btn:hover { color: #ffffff !important; border-color: #ef4444 !important; background: #ef4444 !important; box-shadow: 0 0 6px rgba(239, 68, 68, 0.2) !important; }
@keyframes glow { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
</style>