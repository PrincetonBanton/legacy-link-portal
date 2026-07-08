<template>
  <div class="visual-card line-trend-panel">
    <div class="card-header">
      {{ formattedHeaderTitle }}
    </div>
    
    <div class="chart-container-frame">
      <div v-if="chartData?.datasets?.[0]?.data?.length" class="chart-wrapper">
        <Line :data="computedChartData" :options="chartOptions" />
      </div>
      <div v-else class="chart-placeholder">No trend dataset active.</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler)

const props = defineProps({ 
  chartData: { type: Object, required: true },
  areaName: { type: String, default: '' },
  systemType: { type: String, default: '' }
})

// 🔤 Combines the fields into: "[AREA] [SYSTEM] DAILY INVOICES"
const formattedHeaderTitle = computed(() => {
  const area = props.areaName ? props.areaName.trim() : 'GLOBAL'
  const system = props.systemType ? props.systemType.trim() : 'OPERATIONS'
  
  // Strips word "System" if it's already trailing in systemType to avoid "PRODUCTION SYSTEM DAILY INVOICES"
  const cleanSystem = system.toUpperCase().replace(/\bSYSTEM\b/g, '').trim()
  
  return `${area.toUpperCase()} ${cleanSystem} `.replace(/\s+/g, ' ')
})

const computedChartData = computed(() => {
  if (!props.chartData || !props.chartData.datasets) return props.chartData
  return {
    ...props.chartData,
    datasets: props.chartData.datasets.map(dataset => ({
      ...dataset,
      label: 'Financial Value', borderColor: '#10b981', borderWidth: 2, tension: 0.3, fill: true,
      backgroundColor: (context) => {
        const chart = context.chart; const { ctx, chartArea } = chart; if (!chartArea) return null
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.22)')
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)')
        return gradient
      },
      pointBackgroundColor: '#10b981', pointBorderColor: '#111827', pointBorderWidth: 1.5, pointRadius: 3.5,
      pointHoverRadius: 5.5, pointHoverBackgroundColor: '#34d399', pointHoverBorderColor: '#ffffff', pointHoverBorderWidth: 2
    }))
  }
})

const chartOptions = {
  responsive: true, 
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true, 
      backgroundColor: '#1e293b', 
      titleColor: '#94a3b8', 
      bodyColor: '#34d399',
      bodyFont: { weight: 'bold', family: 'monospace' }, 
      borderColor: '#334155', 
      borderWidth: 1, 
      padding: 8, 
      displayColors: false,
      callbacks: { 
        label: (context) => context.parsed.y !== null ? '₱ ' + context.parsed.y.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' 
      }
    }
  },
  scales: {
    x: { 
      grid: { color: 'rgba(100, 116, 139, 0.12)', drawTicks: false }, 
      ticks: { color: '#64748b', font: { size: 9 } } 
    },
    y: { 
      type: 'linear', 
      grid: { color: 'rgba(100, 116, 139, 0.12)', drawTicks: false }, 
      ticks: { color: '#64748b', font: { size: 9, family: 'monospace' }, callback: (value) => value.toLocaleString() } 
    }
  }
}
</script>

<style scoped>
.visual-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; display: flex; flex-direction: column; overflow: hidden; height: 100%; width: 100%; transition: background .25s ease, border-color .25s ease; }
.card-header { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; background: var(--bg-nav); padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--border-color); text-align: left; letter-spacing: 0.02em; transition: background .25s ease, border-color .25s ease, color .25s ease; }
.chart-container-frame { flex: 1; position: relative; width: 100%; height: 100%; min-height: 0; padding: 0.5rem 0.75rem; box-sizing: border-box; display: flex; flex-direction: column; }
.chart-wrapper { flex: 1; width: 100%; height: 100%; position: relative; min-height: 0; }
.chart-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.8rem; font-weight: 500; height: 100%; transition: background .25s ease, color .25s ease; }

:global(.dark-theme) .chart-placeholder { background: radial-gradient(circle at center, #131c2e 0%, #0f172a 100%); }
:global(.light-theme) .chart-placeholder { background: radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%); }
</style>