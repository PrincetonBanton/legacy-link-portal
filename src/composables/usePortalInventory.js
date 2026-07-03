import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'

export function usePortalInventory() {
  const rawItems = ref([])
  const isLoading = ref(false)
  const activeCategoryFilter = ref('all')
  const activeSortOrder = ref('highest_value')

  const normalizeGroup = (groupName) => {
    const name = (groupName || '').toLowerCase().trim()
    if (name.includes('material')) return 'materials'
    if (name.includes('chemical')) return 'chemicals'
    if (name.includes('fertilizer') || name.includes('fert')) return 'fertilizer'
    if (name.includes('fuel') || name.includes('pol') || name.includes('oil')) return 'fuel_pol'
    return 'materials'
  }

  const loadPortalInventory = async (targetArea) => {
    if (!targetArea) return
    isLoading.value = true
    try {
      const { data, error } = await supabase.rpc('get_portal_inventory_details', {
        target_area_name: targetArea 
      })
      if (error) throw error
      rawItems.value = data || []
    } catch (err) {
      console.error('Portal inventory sync failure:', err)
      alert(`🔴 Database Connection Fault: ${err.message}`)
    } finally {
      isLoading.value = false
    }
  }

  const categoryTotals = computed(() => {
    const totals = { materials: 0, chemicals: 0, fertilizer: 0, fuel_pol: 0 }
    rawItems.value.forEach(item => {
      const stock = Number(item.available_stock || 0)
      const cost = Number(item.unit_cost || 0)
      totals[normalizeGroup(item.item_group)] += (stock * cost)
    })
    return totals
  })

  const overallTotalValue = computed(() => {
    return Object.values(categoryTotals.value).reduce((sum, val) => sum + val, 0)
  })

  const filteredAndRankedItems = computed(() => {
    return [...rawItems.value]
      .map(item => {
        const stock = Number(item.available_stock || 0)
        const cost = Number(item.unit_cost || 0)
        return {
          id: item.id,
          area_name: item.area_name || 'Global',
          item_code: item.item_code || 'UNKNOWN',
          item_name: item.item_name || 'Unnamed Item',
          item_group: item.item_group || 'Unassigned',
          normalized_group: normalizeGroup(item.item_group),
          available_stock: stock,
          unit_of_measure: item.unit_of_measure || 'pcs',
          unit_cost: cost,
          remarks: item.remarks || '',
          computed_total_value: stock * cost
        }
      })
      .filter(item => activeCategoryFilter.value === 'all' || item.normalized_group === activeCategoryFilter.value)
      .sort((a, b) => {
        if (activeSortOrder.value === 'highest_value' && b.computed_total_value !== a.computed_total_value) {
          return b.computed_total_value - a.computed_total_value
        }
        return a.item_name.toLowerCase().localeCompare(b.item_name.toLowerCase())
      })
  })

  const chartData = computed(() => ({
    labels: ['Materials', 'Chemicals', 'Fertilizer', 'Fuel / POL'],
    datasets: [{
      data: [
        categoryTotals.value.materials,
        categoryTotals.value.chemicals,
        categoryTotals.value.fertilizer,
        categoryTotals.value.fuel_pol
      ],
      backgroundColor: ['#38bdf8', '#a855f7', '#eab308', '#ef4444'],
      borderWidth: 0
    }]
  }))

  return {
    isLoading,
    activeCategoryFilter,
    activeSortOrder,
    categoryTotals,
    overallTotalValue,
    filteredAndRankedItems,
    chartData,
    loadPortalInventory
  }
}