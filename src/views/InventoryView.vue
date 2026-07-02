<template>
  <div class="inventory-view-wrapper">
    <InventoryToolbar 
      v-model:categoryFilter="activeCategoryFilter"
      v-model:sortOrder="activeSortOrder"
      :overall-total-value="overallTotalValue"
      :category-totals="categoryTotals"
      @export-csv="handleExportCSV"
      @trigger-print="handleTriggerPrint"
    />

    <div class="inventory-body-grid">
      <div class="inventory-list-panel">
        <div class="table-scroll-frame">
          <InventoryTable 
            :items="filteredAndRankedItems"
            :is-loading="isLoading"
            :sort-order="activeSortOrder"
            @item-inspect="triggerSmartSearch"
          />
        </div>
      </div>

      <div class="inventory-graph-panel">
        <InventoryDistributionChart :chart-data="chartData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { usePortalInventory } from '../composables/usePortalInventory'
import { downloadCSV } from '../utils/exportUtils'
import InventoryToolbar from '../components/InventoryToolbar.vue'
import InventoryTable from '../components/graphscharts/InventoryTable.vue'
import InventoryDistributionChart from '../components/graphscharts/InventoryDistributionChart.vue'

const props = defineProps({
  selectedContext: { type: Object, default: null }
})

const {
  isLoading,
  activeCategoryFilter,
  activeSortOrder,
  categoryTotals,
  overallTotalValue,
  filteredAndRankedItems,
  chartData,
  loadPortalInventory
} = usePortalInventory()

const isModalOpen = ref(false)
const selectedItemName = ref('')
const selectedItemGroup = ref('')

const triggerSmartSearch = (item) => {
  selectedItemName.value = item.item_name
  selectedItemGroup.value = item.item_group
  isModalOpen.value = true
}

const handleExportCSV = () => {
  const targetArea = props.selectedContext?.area || 'global'
  const targetSystem = props.selectedContext?.systemType || 'operations'
  const nameString = `${targetArea}-${targetSystem}-inventory`.toLowerCase().replace(/\s+/g, '_')
  downloadCSV(filteredAndRankedItems.value, nameString)
}

const handleTriggerPrint = () => { window.print() }

onMounted(async () => {
  if (props.selectedContext?.area) { await loadPortalInventory(props.selectedContext.area) }
})

watch(
  () => props.selectedContext, 
  async (newContext) => {
    if (newContext?.area) { await loadPortalInventory(newContext.area) }
  }, 
  { deep: true, immediate: true }
)
</script>

<style scoped>
.inventory-view-wrapper { display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100vh; box-sizing: border-box; padding: 1rem 1.5rem; overflow: hidden; }
.inventory-body-grid { display: flex; gap: 16px; width: 100%; flex: 1; min-height: 0; }
.inventory-list-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; min-width: 0; height: 100%; overflow: hidden; }
.inventory-graph-panel { flex: 0 0 320px; max-width: 320px; min-width: 260px; width: 100%; height: 100%; }
.table-scroll-frame { flex: 1; overflow-y: auto; padding: 0; min-height: 0; }
</style>