<template>
  <div class="login-wrapper">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2 class="login-header">Sign In </h2>

      <div class="input-group">
        <input v-model="username" type="text" placeholder="User Name" required />
      </div>

      <div class="input-group">
        <input v-model="password" type="password" placeholder="••••••••" required />
      </div>

      <div v-if="errorMessage" class="error-banner">⚠️ {{ errorMessage }}</div>
      <button type="submit" class="auth-btn">Sign In</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login-success'])
const username = ref('')
const password = ref('')
const errorMessage = ref(null)

const handleLogin = () => {
  errorMessage.value = null
  if (username.value === 'admin' && password.value === '1234') {
    emit('login-success')
  } else {
    errorMessage.value = 'Invalid credentials. Hint: admin / 1234'
  }
}
</script>

<style scoped>
.login-wrapper { display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; font-family: system-ui, sans-serif; }
.login-form { padding: 2.5rem; width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 1.25rem; }
.login-header { margin: 0 0 0.25rem 0; font-size: 1.35rem; font-weight: 700; color: #0f172a; text-align: center; }
.input-group { display: flex; flex-direction: column; gap: 0.35rem; text-align: left; }
.input-group input { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; font-size: 0.85rem; outline: none; transition: border-color 0.15s; color: #0f172a; }
.input-group input:focus { border-color: #0f172a; }
.error-banner { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; text-align: left; }
.auth-btn { background: #0f172a; color: #ffffff; border: none; padding: 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: background 0.15s; margin-top: 0.5rem; width: 100%; }
.auth-btn:hover { background: #1e293b; }
</style>