<template>
  <div class="visual-card">
    <div class="card-header">
      Financial Distribution
    </div>
    <div class="chart-container-frame">
      <div v-if="!metricsData || metricsData.length === 0" class="chart-placeholder">
        [Waiting for Supabase payload context...]
      </div>
      <div v-show="metricsData && metricsData.length > 0" class="chart-wrapper">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  metricsData: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chartInstance = null

const renderChart = () => {
  if (!chartRef.value || !props.metricsData.length) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const labels = props.metricsData.map(item => item.identifier)
  const dataValues = props.metricsData.map(item => item.value)

  chartInstance = new Chart(chartRef.value, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: [
          '#36A2EB', '#FF6384', '#FFCD56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#C9CBCF'
        ],
        borderWidth: 1,
        borderColor: 'transparent'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            font: { size: 11 },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw || 0
              return ` ₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
          }
        }
      }
    }
  })
}

// 🍇 Active Pipeline Debugger Hook
watch(() => props.metricsData, (newData) => {
  // alert(
  //   `🔍 Distribution Panel Debugger Sync:\n` +
  //   `• Data Type: ${typeof newData}\n` +
  //   `• Is Array: ${Array.isArray(newData)}\n` +
  //   `• Array Length: ${newData ? newData.length : 0}\n` +
  //   `• Raw Payload Content: ${JSON.stringify(newData)}`
  // )

  if (newData && newData.length > 0) {
    setTimeout(renderChart, 0)
  }
}, { deep: true, immediate: true })

onMounted(() => {
  if (props.metricsData && props.metricsData.length) renderChart()
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
/* 📁 Compact Layout Framework & Unified Theme Conventions */
.visual-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; display: flex; flex-direction: column; overflow: hidden; height: 100%; width: 100%; transition: background .25s ease, border-color .25s ease; }
.card-header { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; background: var(--bg-nav); padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--border-color); text-align: left; letter-spacing: 0.02em; transition: background .25s ease, border-color .25s ease, color .25s ease; }
.chart-container-frame { flex: 1; position: relative; width: 100%; height: 100%; min-height: 0; padding: 0.75rem; box-sizing: border-box; display: flex; flex-direction: column; }
.chart-wrapper { flex: 1; width: 100%; height: 100%; position: relative; min-height: 0; }
.chart-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.8rem; font-weight: 500; height: 100%; transition: background .25s ease, color .25s ease; }

/* 🌓 Theme Configurations */
:global(.dark-theme) .chart-placeholder { background: radial-gradient(circle at center, #131c2e 0%, #0f172a 100%); }
:global(.light-theme) .chart-placeholder { background: radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%); }
</style>