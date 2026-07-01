// src/composables/useInventoryData.js
import { ref } from 'vue'
import { supabase } from '../supabaseClient' // Your configured Supabase client instance

export function useInventoryData() {
  const inventoryItems = ref([])
  const isFetching = ref(false)
  const fetchError = ref(null)

  const fetchInventoryByArea = async (areaName) => {
    if (!areaName) return

    isFetching.value = true
    fetchError.value = null
    inventoryItems.value = []

    try {
      // 🚀 Query your specific database table filtering by the selected area string
      const { data, error } = await supabase
        .from('inventory_master') 
        .select('*')
        .eq('area_name', areaName.trim())

      if (error) throw error

      inventoryItems.value = data || []
    } catch (err) {
      console.error('Supabase fetch execution failure:', err.message)
      fetchError.value = err.message
    } finally {
      isFetching.value = false
    }
  }

  return {
    inventoryItems,
    isFetching,
    fetchError,
    fetchInventoryByArea
  }
}