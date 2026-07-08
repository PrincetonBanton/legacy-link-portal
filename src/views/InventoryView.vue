<template>
  <div class="inventory-view-wrapper">
    <InventoryToolbar 
      v-model:sortOrder="activeSortOrder"
      @update:searchQuery="(q) => searchQuery = q"
      @export-csv="handleExportCSV"
      @trigger-print="handleInventoryPrint"
    />

    <div class="inventory-body-grid">
      <InventoryStatsRow 
        v-model:categoryFilter="activeCategoryFilter"
        :overall-total-value="overallTotalValue"
        :category-totals="categoryTotals"
      />
      
      <div class="inventory-left-panel">
        <div class="table-scroll-frame">
          <InventoryTable 
            :items="searchFilteredItems"
            :is-loading="isLoading"
            :sort-order="activeSortOrder"
            @item-inspect="triggerSmartSearch"
          />
        </div>
      </div>

      <div class="inventory-right-panel">
        <InventoryDistributionChart 
          :chart-data="chartData" 
          :area-name="selectedContext?.area" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue'
import { usePortalInventory } from '../composables/usePortalInventory'
import { downloadCSV } from '../utils/exportUtils'
import { exportToPDF } from '../utils/dashboardActions.js'

import InventoryToolbar from '../components/InventoryToolbar.vue'
import InventoryStatsRow from '../components/graphscharts/InventoryStatsRow.vue' 
import InventoryTable from '../components/graphscharts/InventoryTable.vue'
import InventoryDistributionChart from '../components/graphscharts/InventoryDistributionChart.vue'

const props = defineProps({
  selectedContext: { type: Object, default: null }
})

const {
  isLoading, activeCategoryFilter, activeSortOrder, categoryTotals, overallTotalValue, filteredAndRankedItems, chartData,
  loadPortalInventory
} = usePortalInventory()

const searchQuery = ref('')

const searchFilteredItems = computed(() => {
  const cleanQuery = searchQuery.value.toLowerCase().trim()
  if (!cleanQuery) return filteredAndRankedItems.value

  return filteredAndRankedItems.value.filter(item => 
    item.item_name?.toLowerCase().includes(cleanQuery) ||
    item.item_code?.toLowerCase().includes(cleanQuery) ||
    item.item_group?.toLowerCase().includes(cleanQuery)
  )
})

const triggerSmartSearch = (item) => {
  console.log('Inspecting Asset Record Context:', item)
}

const handleExportCSV = () => {
  const targetArea = props.selectedContext?.area || 'global'
  const targetSystem = props.selectedContext?.systemType || 'operations'
  const nameString = `${targetArea}-${targetSystem}-inventory`.toLowerCase().replace(/\s+/g, '_')
  downloadCSV(searchFilteredItems.value, nameString) 
}

const handleInventoryPrint = () => {
  if (props.selectedContext) {
    exportToPDF(props.selectedContext, '.inventory-body-grid', true)
  }
}

onMounted(async () => {
  activeSortOrder.value = 'highest_value'
  if (props.selectedContext?.area) { await loadPortalInventory(props.selectedContext.area) }
})

watch(activeCategoryFilter, () => { searchQuery.value = '' })

watch(
  () => props.selectedContext, 
  async (newContext) => {
    if (newContext?.area) { await loadPortalInventory(newContext.area) }
  }, 
  { deep: true, immediate: true }
)
</script>

<style scoped>

.inventory-view-wrapper { display: flex; flex-direction: column; width: 100%; height: 100vh; box-sizing: border-box; padding: 1rem; overflow: hidden; }
.inventory-body-grid { display: grid; grid-template-columns: 1fr 320px; grid-template-rows: auto 1fr; gap: 16px; width: 100%; flex: 1; min-height: 0; }
.inventory-left-panel { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; min-width: 0; height: 100%; overflow: hidden; }
.inventory-right-panel { grid-column: 2; grid-row: 2; width: 100%; max-width: 320px; min-width: 260px; height: 100%; }
.table-scroll-frame { flex: 1; overflow-y: auto; padding: 0; min-height: 0; }
:deep(.stats-grid-row) { grid-column: 1 / span 2; grid-row: 1; }

:global(.html2pdf__container) .inventory-view-wrapper, :global(.html2pdf__container) .inventory-body-grid, 
:global(.html2pdf__container) .inventory-left-panel, :global(.html2pdf__container) .inventory-right-panel 
  { height: auto !important; max-height: none !important; overflow: visible !important; }

:global(.html2pdf__container) .table-scroll-frame 
  { overflow: visible !important; height: auto !important; max-height: none !important; }
</style>