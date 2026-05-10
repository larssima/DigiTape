<template>
  <div class="callback-page">
    <div v-if="error" class="banner error">{{ error }}</div>
    <div v-else class="loading-text">Connecting to Spotify…</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleCallback } from '../spotify.js'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const err = params.get('error')

  if (err) {
    error.value = `Spotify auth failed: ${err}`
    return
  }
  if (!code) {
    error.value = 'No authorization code received.'
    return
  }

  const ok = await handleCallback(code)
  if (ok) {
    router.replace('/')
  } else {
    error.value = 'Failed to exchange authorization code. Check your Client ID and redirect URI.'
  }
})
</script>

<style scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  padding: 24px;
}

.loading-text {
  color: var(--text-sub);
  font-size: 16px;
}
</style>
