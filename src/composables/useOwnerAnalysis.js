import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'

export function useOwnerAnalysis() {
  const isFetchingBase = ref(false)
  const isFetchingTrends = ref(false)
  const isFetchingBlocks = ref(false)
  const isFetchingProducts = ref(false)
  const isFetchingGroups = ref(false)
  
  const fetchError = ref(null)
  const groupedSummary = ref([])
  const dailyTrendsData = ref([])
  const blockMetricsData = ref([])
  const productMetricsData = ref([])
  const groupMetricsData = ref([])

  // 🔄 Unified status hook to catch any sub-pipeline requests instantly
  const isFetching = computed(() => {
    return isFetchingBase.value || 
           isFetchingTrends.value || 
           isFetchingBlocks.value || 
           isFetchingProducts.value || 
           isFetchingGroups.value
  })

  const loadEnterpriseData = async () => {
    isFetchingBase.value = true
    fetchError.value = null
    try {
      const { data, error } = await supabase.rpc('get_system_analysis_summary')
      if (error) throw error
      groupedSummary.value = data.map(row => ({
        area: row.area,
        systemType: row.system_type,
        minDate: row.min_date,
        maxDate: row.max_date,
        count: parseInt(row.row_count)
      }))
    } catch (err) {
      console.error(err)
      fetchError.value = err.message
    } finally {
      isFetchingBase.value = false
    }
  }

  const fetchRawExportDataset = async (area, systemType, startDate, endDate) => {
    try {
      const { data, error } = await supabase.rpc('export_raw_delivery_audit_log', {
        filter_area: area,
        filter_system: systemType,
        start_date: startDate,
        end_date: endDate
      })
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Critical database export extraction failure:', err)
      alert(`🔴 Export Pipeline Error: ${err.message}`)
      return []
    }
  }

  const fetchTrends = async (area, systemType, startDate, endDate) => {
    if (!area || !systemType || !startDate || !endDate) return
    isFetchingTrends.value = true
    try {
      const { data, error } = await supabase.rpc('get_daily_trends', {
        filter_area: area,
        filter_system: systemType,
        start_date: startDate,
        end_date: endDate
      })
      if (error) throw error
      dailyTrendsData.value = data || []
    } catch (err) {
      console.error('Trend synchronization failed:', err)
      alert(`🔴 fetchTrends System Error: ${err.message}`)
    } finally {
      isFetchingTrends.value = false
    }
  }

  const fetchBlockAggregations = async (area, systemType, startDate, endDate) => {
    if (!area || !systemType || !startDate || !endDate) return
    isFetchingBlocks.value = true
    try {
      const { data, error } = await supabase.rpc('get_block_aggregations', {
        filter_area: area,
        filter_system: systemType,
        start_date: startDate,
        end_date: endDate
      })
      if (error) throw error
      blockMetricsData.value = (data || []).map(row => ({
        identifier: row.block_name,
        value: parseFloat(row.total_value || 0)
      }))
    } catch (err) {
      console.error('Block aggregation sync failed:', err)
      blockMetricsData.value = []
    } finally {
      isFetchingBlocks.value = false
    }
  }

  const fetchProductAggregations = async (area, systemType, startDate, endDate) => {
    if (!area || !startDate || !endDate) return
    isFetchingProducts.value = true
    try {
      const { data, error } = await supabase.rpc('get_product_aggregations', {
        filter_area: area,
        filter_system: systemType, 
        start_date: startDate,
        end_date: endDate
      })
      if (error) throw error
      productMetricsData.value = (data || []).map(row => ({
        identifier: row.product_name || row.identifier,
        value: parseFloat(row.total_value || 0)
      }))
    } catch (err) {
      console.error('Product aggregation sync failed:', err)
      productMetricsData.value = []
    } finally {
      isFetchingProducts.value = false
    }
  }

  const fetchGroupAggregations = async (area, systemType, startDate, endDate) => {
    if (!area || !startDate || !endDate) return
    isFetchingGroups.value = true
    try {
      const { data, error } = await supabase.rpc('get_group_aggregations', {
        filter_area: area,
        filter_system: systemType, 
        start_date: startDate,
        end_date: endDate
      })
      if (error) throw error
      groupMetricsData.value = (data || []).map(row => ({
        identifier: row.group_name || row.identifier,
        value: parseFloat(row.total_value || 0)
      }))
    } catch (err) {
      console.error('Group aggregation sync failed:', err)
      groupMetricsData.value = []
    } finally {
      isFetchingGroups.value = false
    }
  }

  return { 
    isFetching, 
    isFetchingTrends,
    isFetchingBlocks,
    isFetchingProducts, 
    isFetchingGroups,  
    fetchError, 
    groupedSummary, 
    dailyTrendsData,
    blockMetricsData,
    productMetricsData, 
    groupMetricsData,   
    loadEnterpriseData, 
    fetchRawExportDataset, 
    fetchTrends,
    fetchBlockAggregations,
    fetchProductAggregations, 
    fetchGroupAggregations    
  }
}