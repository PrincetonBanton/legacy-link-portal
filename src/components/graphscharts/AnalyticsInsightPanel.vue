<template>
  <div class="insights-panel" :class="{ 'error-panel': hasError, 'awaiting-panel': !aiResponse }">
    <div class="panel-header">
      <strong>{{ hasError ? 'Diagnostic Error Log:' : 'AI Executive Summary:' }}</strong>
    </div>
    <div class="insights-content">
      <p class="status-text">
        {{ aiResponse || 'Awaiting execution request. Click the action button to process the dataset grid matrix...' }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  aiResponse: { type: String, default: '' },
  hasError: { type: Boolean, default: false }
})
</script>
<style scoped>
/* 🖥️ SCREEN */
.insights-panel { padding: 1rem; background: #f0fdf4; border-radius: 8px; text-align: left; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; }
.insights-content {flex: 1; overflow-y: auto; padding-right: 6px; }
.awaiting-panel { background: #f8fafc; border-left-color: #cbd5e1; }
.error-panel { background: #fef2f2; border-left-color: #ef4444; }
.panel-header { font-size: 0.68rem; color: #166534; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; border-bottom: 1px dashed rgba(0,0,0,0.08); padding-bottom: 6px; }
.status-text { color: #1e293b; font-size: 0.78rem; margin: 0; line-height: 1.6; white-space: pre-line; }
.awaiting-panel .status-text { color: #94a3b8; font-style: italic; font-weight: 600; }

/* 🖨️ PRINT */
:global(.html2pdf__container) .insights-panel, 
:global(.html2pdf__container) .insights-content, 
:global(.html2pdf__container) .status-text { height: auto !important; max-height: none !important; overflow: visible !important; display: block !important; }
:global(.html2pdf__container) .insights-panel { border-left: none !important; padding: 0 !important; background: transparent !important; }
:global(.html2pdf__container) .status-text { white-space: normal !important; word-break: break-word !important; }
</style>