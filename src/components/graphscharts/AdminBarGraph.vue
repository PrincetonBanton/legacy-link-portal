<template>
  <div class="visual-card bar-aggregation-panel">
    <div class="card-header">Structural Block Aggregations</div>
    <div class="chart-container-frame">
      <div v-if="hasData" class="chart-wrapper">
        <Bar :data="chartData" :options="chartOptions" :key="chartKey" />
      </div>
      <div v-else class="chart-placeholder">
        <span class="placeholder-icon">📊</span>
        <p>No distinct block segments active within current filters.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, BarController } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, BarController)

const props = defineProps({ chartData: { type: Object, required: true } })
const chartKey = ref(0)
watch(() => props.chartData, () => { chartKey.value++ }, { deep: true })
const hasData = computed(() => props.chartData?.datasets?.[0]?.data?.length > 0)

const chartOptions = {
  responsive: true, 
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false } 
  },
  scales: {
    /* 🌟 Translucent slate-gray horizontal gridlines */
    y: { 
      grid: { color: 'rgba(100, 116, 139, 0.12)' }, 
      ticks: { color: '#64748b', font: { size: 9 } } 
    },
    x: { 
      grid: { display: false }, 
      ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45, minRotation: 45 } 
    }
  }
}
</script>

<style scoped>
.visual-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; display: flex; flex-direction: column; overflow: hidden; height: 100%; width: 100%; transition: background .25s ease, border-color .25s ease; }
.card-header { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; background: var(--bg-nav); padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--border-color); text-align: left; letter-spacing: 0.02em; transition: background .25s ease, border-color .25s ease, color .25s ease; }
.chart-container-frame { flex: 1; position: relative; width: 100%; height: 100%; min-height: 0; padding: 0.5rem 0.75rem; box-sizing: border-box; display: flex; flex-direction: column; }
.chart-wrapper { flex: 1; width: 100%; height: 100%; position: relative; min-height: 0; }

/* 📊 Dynamic Background Adaptive State for Chart Placeholders */
.chart-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.8rem; gap: 0.25rem; height: 100%; transition: background .25s ease, color .25s ease; }
.placeholder-icon { font-size: 1.5rem; opacity: 0.35; }
.chart-placeholder p { margin: 0; font-weight: 500; letter-spacing: 0.01em; }

/* Theme specific adjustments for the fallback placeholder canvas state */
:global(.dark-theme) .chart-placeholder { background: radial-gradient(circle at center, #131c2e 0%, #0f172a 100%); }
:global(.light-theme) .chart-placeholder { background: radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%); }
</style>