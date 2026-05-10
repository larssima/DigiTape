<template>
  <nav class="nav">
    <RouterLink to="/" class="nav-item" :class="{ active: route.path === '/' }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="2" y="7" width="20" height="10" rx="2"/>
        <circle cx="8.5" cy="12" r="1.5"/>
        <circle cx="15.5" cy="12" r="1.5"/>
        <path d="M10 12h4"/>
        <path d="M2 10h2M20 10h2M2 14h2M20 14h2"/>
      </svg>
      <span>Scan</span>
    </RouterLink>

    <RouterLink to="/settings" class="nav-item" :class="{ active: route.path === '/settings' }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span>Settings</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--nav-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: rgba(15, 15, 19, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);
  display: flex;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-sub);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2px;
  transition: color 0.15s;
  padding: 8px 0 0;
  -webkit-tap-highlight-color: transparent;
}

.nav-item.active { color: var(--accent); }
</style>
