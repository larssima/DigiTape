<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">Settings</div>
    </div>

    <div class="settings-section">
      <h2>Spotify</h2>

      <template v-if="!loggedIn">
        <button class="btn-primary" @click="connect">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Connect Spotify
        </button>
      </template>

      <template v-else>
        <div v-if="user" class="user-card">
          <img v-if="user.images?.[0]?.url" :src="user.images[0].url" class="user-avatar" alt="" />
          <div v-else class="user-avatar-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.display_name || user.id }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
        </div>

        <div class="stat-row">
          <span class="label">Status</span>
          <span class="value connected">Connected</span>
        </div>

        <button class="danger-btn" @click="disconnect">Disconnect Spotify</button>
        <button class="debug-btn" @click="debugExpireSession">Simulate expired session (debug)</button>
      </template>
    </div>

    <div class="settings-section" style="margin-top: 28px; padding-bottom: 24px">
      <h2>About</h2>
      <div class="stat-row">
        <span class="label">DigiTape</span>
        <span class="value">v0.1.0</span>
      </div>
      <p class="hint" style="padding-top: 4px">
        Scan your old mixtapes and turn them into Spotify playlists using AI.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { isLoggedIn, login, logout, getMe } from '../spotify.js'

const loggedIn = ref(isLoggedIn())
const user = ref(null)

onMounted(async () => {
  if (loggedIn.value) {
    try { user.value = await getMe() } catch { loggedIn.value = false }
  }
})

async function connect() {
  await login()
}

function disconnect() {
  logout()
  loggedIn.value = false
  user.value = null
}

// TEMP DEBUG - remove after verifying the reauth flow ahead of Spotify's July 20, 2026 refresh-token expiry change
async function debugExpireSession() {
  localStorage.setItem('spotify_refresh_token', 'debug-invalid-token')
  localStorage.setItem('spotify_expires_at', '0')
  try {
    user.value = await getMe()
  } catch {
    loggedIn.value = false
    user.value = null
  }
}
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 8px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  flex-shrink: 0;
}

.user-info { min-width: 0; }
.user-name { font-weight: 600; font-size: 15px; }
.user-email { font-size: 12px; color: var(--text-sub); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.connected { color: var(--accent); }

.debug-btn {
  display: block;
  width: 100%;
  margin-top: 8px;
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-sub);
  border-radius: var(--radius);
  padding: 10px;
  font-size: 12px;
  cursor: pointer;
}
</style>
