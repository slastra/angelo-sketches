<script setup lang="ts">
const password = ref('')
const error = ref<string | null>(null)
const busy = ref(false)

async function submit() {
  if (!password.value || busy.value) return
  busy.value = true
  error.value = null
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/admin')
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'login failed'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="app">
    <PaperBackground texture="dot-grid" />
    <CornerMark ink="oklch(0.24 0.05 255)" />

    <main class="login-wrap">
      <JitteredBorder seed="login-card" :stroke-width="1.1" :jitter="1.4" :double-stroke="true" class="login-card">
        <form @submit.prevent="submit">
          <h1 class="handwritten">enter</h1>
          <JitteredBorder seed="login-input" :stroke-width="0.8" :jitter="0.6" class="input-wrap">
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="password"
              class="login-input handwritten"
              :disabled="busy"
            >
          </JitteredBorder>
          <JitteredBorder seed="login-button" :stroke-width="1.0" :jitter="0.9" class="button-wrap">
            <button type="submit" class="login-button handwritten" :disabled="busy || !password">
              {{ busy ? '...' : 'unlock →' }}
            </button>
          </JitteredBorder>
          <div v-if="error" class="login-error handwritten">{{ error }}</div>
        </form>
      </JitteredBorder>
    </main>
  </div>
</template>

<style scoped>
.login-wrap {
  position: relative;
  z-index: 1;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  width: 280px;
  padding: 32px 28px;
  color: oklch(0.24 0.05 255);
}
.login-card form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.login-card h1 {
  margin: 0;
  font-size: 36px;
  font-family: var(--hand-display);
  font-weight: 600;
  text-align: center;
}

.input-wrap, .button-wrap { display: block; }

.login-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 18px;
  color: inherit;
  font-family: var(--hand);
}
.login-button {
  width: 100%;
  height: 36px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  font-family: var(--hand);
}
.login-button:disabled { opacity: 0.4; cursor: not-allowed; }
.login-button:not(:disabled):hover { background: rgba(28, 36, 64, 0.06); }

.login-error {
  text-align: center;
  font-size: 14px;
  color: #b04020;
  opacity: 0.85;
}
</style>
