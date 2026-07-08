<template>
  <div class="error-card">
    <h4>Secure Connection Pipeline Interrupted</h4>
    <p>{{ errorMessage }}</p>
  </div>
</template>

<script setup>
defineProps({
  errorMessage: { type: String, default: 'An unexpected operational variance occurred.' }
})
</script>

<style scoped>
.loading-overlay { position: absolute; inset: 0; background: var(--bg-main, #ffffff); display: flex; align-items: center; justify-content: center; z-index: 100; }
.spinner { width: 48px; height: 48px; border: 4px solid var(--border-color, #e2e8f0); border-top-color: #10b981; border-radius: 50%; animation: spin-clockwise 0.8s linear infinite; }
@keyframes spin-clockwise { to { transform: rotate(360deg); } }
</style>