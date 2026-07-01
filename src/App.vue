<template>
  <div :class="['app-root-wrapper', isDarkMode ? 'dark-theme' : 'light-theme']">
    <MainDashboardHub />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import MainDashboardHub from './views/MainDashboardHub.vue'

const isDarkMode = ref(false)

const toggleTheme = () => { 
  isDarkMode.value = !isDarkMode.value 
}
provide('theme', { isDarkMode, toggleTheme })
</script>

<style>
/*CRITICAL: These MUST be global rules without 'scoped' so they target the root browser tags */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
}

#app {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  min-height: 100vh !important;
  margin: 0 !important;
}
</style>

<style scoped>
.app-root-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>