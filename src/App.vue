<template>
  <div :class="['app-root-wrapper', isDarkMode ? 'dark-theme' : 'light-theme']">
    <MainDashboardHub v-if="isAuthenticated" @sign-out="isAuthenticated = false" />
    <LoginView v-else @login-success="isAuthenticated = true" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import MainDashboardHub from './views/MainDashboardHub.vue'
import LoginView from './views/LoginView.vue'

const isAuthenticated = ref(false)
const isDarkMode = ref(false)

const toggleTheme = () => { 
  isDarkMode.value = !isDarkMode.value 
}

provide('theme', { isDarkMode, toggleTheme })
</script>

<style>
/* GLOBAL LAYOUT ARCHITECTURE */
html, body, #app { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100vh !important; overflow: hidden !important; }
body { background-color: #ffffff; }
</style>

<style scoped>
/* VIEW WORKSPACE SHELL */
.app-root-wrapper { width: 100%; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
</style>