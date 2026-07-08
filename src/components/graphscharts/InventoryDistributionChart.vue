<template>
  <div class="chart-card">
    <h3>{{ formattedTitle }}</h3>
    <div class="chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({ 
  chartData: Object,
  areaName: { type: String, default: '' }
})

const formattedTitle = computed(() => {
  const area = props.areaName ? props.areaName.trim().toUpperCase() : 'GLOBAL'
  return `${area} DISTRIBUTION`
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'bottom', 
      labels: { 
        color: '#94a3b8', 
        font: { weight: '600', size: 10 },
        boxWidth: 12,
        padding: 14,

        generateLabels: (chart) => {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              const meta = chart.getDatasetMeta(0)
              const style = meta.controller.getStyle(i)
              const value = data.datasets[0].data[i] || 0
              const formattedValue = value.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })

              return {
                text: `${label.toUpperCase()}: ${formattedValue}`,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                hidden: !chart.getDataVisibility(i),
                index: i
              }
            })
          }
          return []
        }
      } 
    },
    tooltip: {
      callbacks: {
        label: (context) => ` ₱${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      }
    }
  }
}))
</script>

<style scoped>
.chart-card { display: flex; flex-direction: column; height: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; box-sizing: border-box; transition: background .25s ease, border-color .25s ease; }
.chart-card h3 { margin: 0 0 1rem 0; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; transition: color .25s ease; text-align: left; }
.chart-container { flex: 1; position: relative; min-height: 0; }
</style>