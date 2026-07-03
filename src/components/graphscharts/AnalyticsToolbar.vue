<template>
  <div class="step-testing-panel">
    <button 
      class="pipeline-btn theme-emerald" 
      :class="{ 'is-active': activeDatasetType === 'trends' }"
      @click="emit('fetch-trends')" 
      :disabled="isFetching"
    >
      {{ isFetching && activeDatasetType === 'trends' ? 'Fetching...' : 'Invoice' }}
    </button>

    <button 
      class="pipeline-btn theme-sky" 
      :class="{ 'is-active': activeDatasetType === 'blocks' }"
      @click="emit('fetch-blocks')" 
      :disabled="isFetching"
    >
      {{ isFetching && activeDatasetType === 'blocks' ? 'Fetching...' : 'Blocking' }}
    </button>

    <button 
      class="pipeline-btn theme-purple" 
      :class="{ 
        'is-active': activeDatasetType === 'products',
        'system-restricted': selectedContext?.systemType !== 'Production System'
      }"
      @click="emit('fetch-products')" 
      :disabled="isFetching || selectedContext?.systemType !== 'Production System'"
    >
      {{ isFetching && activeDatasetType === 'products' ? 'Fetching...' : 'Product' }}
    </button>

    <button 
      class="pipeline-btn theme-pink" 
      :class="{ 
        'is-active': activeDatasetType === 'groups',
        'system-restricted': selectedContext?.systemType === 'Production System'
      }"
      @click="emit('fetch-groups')" 
      :disabled="isFetching || selectedContext?.systemType === 'Production System'"
    >
      {{ isFetching && activeDatasetType === 'groups' ? 'Fetching...' : 'Category' }}
    </button>

    <button class="btn-utility print" @click="triggerPrint">
      🖨️ Print Report
    </button>

    <button 
      class="ai-trigger-btn" 
      @click="emit('run-analysis')" 
      :disabled="isGenerating || !hasRows"
      :title="`Analyze ${activeDatasetType.toUpperCase()} Dataset`"
    >
      <span>{{ isGenerating ? 'Computing...' : 'Run AI ✨' }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  activeDatasetType: { type: String, required: true },
  selectedContext: { type: Object, default: null },
  isFetching: { type: Boolean, default: false },
  isGenerating: { type: Boolean, default: false },
  hasRows: { type: Boolean, default: false }
})

const emit = defineEmits(['fetch-trends', 'fetch-blocks', 'fetch-products', 'fetch-groups', 'run-analysis'])

const triggerPrint = () => {
  window.print()
}
</script>

<style scoped>
.step-testing-panel { padding: 1rem 0; background: var(--bg-surface, #ffffff); display: flex; gap: 10px; align-items: center; flex-wrap: wrap; width: 100%; box-sizing: border-box; }

.pipeline-btn { margin: 0; width: auto; padding: 8px 16px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; border-radius: 50px; cursor: pointer; border: 1px solid transparent; color: white; opacity: 0.45; transition: opacity 0.2s ease, transform 0.1s ease; }
.pipeline-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
.pipeline-btn.is-active { opacity: 1 !important; transform: none !important; }
.pipeline-btn:disabled { cursor: not-allowed; }
.pipeline-btn.system-restricted { background: #64748b !important; opacity: 0.25 !important; cursor: not-allowed; }

.pipeline-btn.theme-emerald { background: #10b981; }
.pipeline-btn.theme-sky { background: #3b82f6; }
.pipeline-btn.theme-purple { background: #8b5cf6; }
.pipeline-btn.theme-pink { background: #ec4899; }

.btn-utility { background: var(--bg-surface, #ffffff); border: 1px solid #cbd5e1; color: #64748b; font-size: 0.68rem; font-weight: 800; padding: 8px 14px; border-radius: 50px; cursor: pointer; transition: all 0.15s ease; display: inline-flex; align-items: center; white-space: nowrap; }
.btn-utility:hover { color: #ffffff; background: #3b82f6; border-color: transparent; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.04); }

.ai-trigger-btn { margin-left: auto; background: #0f172a; color: white; border: none; padding: 8px 14px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; border-radius: 50px; cursor: pointer; transition: background 0.15s ease, transform 0.1s ease; display: flex; align-items: center; gap: 4px; }
.ai-trigger-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-1px); }
.ai-trigger-btn:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; }
</style>