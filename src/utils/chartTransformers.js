// src/utils/chartTransformers.js

/**
 * Prepares the line chart dataset by aggregating values by date and sorting chronologically
 */
export const transformLineChartData = (dailyTrendsValue) => {
  const dailyAggregation = dailyTrendsValue.reduce((acc, row) => {
    if (!row.trend_date) return acc
    const key = row.trend_date.split(' ')[0]
    acc[key] = (acc[key] || 0) + parseFloat(row.total_financial_value || 0)
    return acc
  }, {})

  const sortedDates = Object.keys(dailyAggregation).sort((a, b) => new Date(a) - new Date(b))
  
  return {
    labels: sortedDates.map(dStr => 
      new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' })
    ),
    datasets: [{
      label: 'Daily Totals (Trend)',
      backgroundColor: 'rgba(16, 185, 129, 0.04)',
      borderColor: '#10b981',
      pointBackgroundColor: '#064e3b',
      borderWidth: 2,
      tension: 0.2,
      data: sortedDates.map(k => dailyAggregation[k])
    }]
  }
}

/**
 * Prepares the bar chart dataset for individual layout blocks
 */
export const transformBarChartData = (blockMetricsValue) => {
  const dataSource = blockMetricsValue || []
  return {
    labels: dataSource.map(item => item.identifier || 'Unknown'),
    datasets: [{
      label: 'Financial Value per Block',
      backgroundColor: '#3b82f6',
      borderRadius: 4,
      data: dataSource.map(item => parseFloat(item.value || 0))
    }]
  }
}

/**
 * Routes the correct dataset for the pie / distribution metrics (Admin Ranking Data)
 * based on the active system type selected in the sidebar
 */
export const routePieMetricsData = (activeSelection, productMetrics, groupMetrics) => {
  if (!activeSelection) return []
  return activeSelection.systemType === 'Production System' 
    ? productMetrics 
    : groupMetrics
}