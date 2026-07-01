<template>
  <div class="chart-card">
    <h3>ASSET DISTRIBUTION BY VALUE</h3>
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

defineProps({ chartData: Object })

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: '600', size: 11 } } },
    tooltip: {
      callbacks: {
        label: (context) => ` $${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      }
    }
  }
}))
</script>

<style scoped>
/* 🚀 Minimalist Layout Context Architecture */
.chart-card { display: flex; flex-direction: column; height: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; box-sizing: border-box; transition: background .25s ease, border-color .25s ease; }
.chart-card h3 { margin: 0 0 1rem 0; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; transition: color .25s ease; }
.chart-container { flex: 1; position: relative; min-height: 0; }
</style>