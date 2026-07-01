<template>
  <div class="inventory-view-wrapper">
    <InventoryToolbar 
      v-model:categoryFilter="activeCategoryFilter"
      :overall-total-value="overallTotalValue"
      :category-totals="categoryTotals"
    />

    <InventoryVisualizer 
      v-model:categoryFilter="activeCategoryFilter"
      v-model:sortOrder="activeSortOrder"
      :items="filteredAndRankedItems"
      :chart-data="chartData"
      :is-loading="isLoading"
      :area-context-name="selectedContext?.area"
      @item-inspect="triggerSmartSearch"
      @export-csv="handleExportCSV"
      @trigger-print="handleTriggerPrint"
    />
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { usePortalInventory } from '../composables/usePortalInventory'
import InventoryToolbar from '../components/InventoryToolbar.vue'
import InventoryVisualizer from '../components/InventoryVisualizer.vue'
import { downloadCSV } from '../utils/exportUtils'

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

const handleTriggerPrint = () => {
  window.print()
}

onMounted(async () => {
  if (props.selectedContext?.area) {
    await loadPortalInventory(props.selectedContext.area)
  }
})

// Modern context watchers checking changes on top navbar dropdown modifications
watch(
  () => props.selectedContext, 
  async (newContext) => {
    if (newContext?.area) {
      await loadPortalInventory(newContext.area)
    }
  }, 
  { deep: true, immediate: true }
)
</script>

<style scoped>
.inventory-view-wrapper { display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; box-sizing: border-box; padding: 1rem 1.5rem; }
</style>