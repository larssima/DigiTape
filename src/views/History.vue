<template>
  <div class="page">
    <div class="page-header">
      <div class="header-row">
        <div class="page-title">History</div>
        <button v-if="scans.length" class="clear-all-btn" @click="confirmClear">Clear all</button>
      </div>
    </div>

    <div v-if="!scans.length" class="empty-state">
      <div class="empty-icon">📼</div>
      <div class="empty-title">No tapes yet</div>
      <div class="empty-sub">Scanned tapes with playlists will appear here.</div>
    </div>

    <div v-else class="scan-list">
      <div v-for="scan in scans" :key="scan.id" class="scan-card">
        <div class="scan-main">
          <div class="scan-header">
            <div class="scan-name">{{ scan.playlistName }}</div>
            <button class="delete-btn" @click="remove(scan.id)" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>

          <div class="scan-meta">
            <span class="scan-date">{{ formatDate(scan.date) }}</span>
            <span class="scan-dot">·</span>
            <span class="scan-tracks">{{ scan.matchedCount }} of {{ scan.trackCount }} tracks matched</span>
          </div>

          <div v-if="scan.tracks?.length" class="track-preview">
            <div v-for="(t, i) in scan.tracks.slice(0, 3)" :key="i" class="track-preview-row">
              <span class="tp-artist">{{ t.matchArtist }}</span>
              <span class="tp-dash">—</span>
              <span class="tp-name">{{ t.matchName }}</span>
            </div>
            <div v-if="scan.tracks.length > 3" class="track-preview-more">
              +{{ scan.tracks.length - 3 }} more
            </div>
          </div>
        </div>

        <a
          v-if="scan.playlistUrl"
          :href="scan.playlistUrl"
          target="_blank"
          rel="noopener"
          class="open-spotify-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Open in Spotify
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getHistory, deleteScan, clearHistory } from '../history.js'

const scans = ref(getHistory())

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function remove(id) {
  deleteScan(id)
  scans.value = getHistory()
}

function confirmClear() {
  if (confirm('Clear all scan history?')) {
    clearHistory()
    scans.value = []
  }
}
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.clear-all-btn {
  background: none;
  border: none;
  color: var(--red);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72px 24px;
  gap: 10px;
  text-align: center;
}

.empty-icon { font-size: 48px; }
.empty-title { font-size: 17px; font-weight: 600; color: var(--text); }
.empty-sub { font-size: 14px; color: var(--text-sub); line-height: 1.5; }

.scan-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }

.scan-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.scan-main { padding: 14px; }

.scan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.scan-name { font-weight: 600; font-size: 16px; line-height: 1.3; }

.delete-btn {
  background: none;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  padding: 2px;
  flex-shrink: 0;
  transition: color 0.15s;
}

.delete-btn:hover { color: var(--red); }

.scan-meta {
  font-size: 12px;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.scan-dot { opacity: 0.5; }

.track-preview { display: flex; flex-direction: column; gap: 3px; }

.track-preview-row {
  font-size: 12px;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tp-artist { color: var(--text); font-weight: 500; }
.tp-dash { margin: 0 4px; opacity: 0.4; }

.track-preview-more {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 2px;
}

.open-spotify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px;
  background: rgba(29, 185, 84, 0.08);
  border-top: 1px solid var(--border);
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}

.open-spotify-btn:hover { background: rgba(29, 185, 84, 0.15); }
</style>
