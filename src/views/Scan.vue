<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">DigiTape</div>
      <div v-if="step !== 'upload'" class="page-sub">{{ stepLabel }}</div>
    </div>

    <!-- Step: upload -->
    <template v-if="step === 'upload'">
      <div
        class="upload-zone"
        :class="{ dragging }"
        @click="fileInput?.click()"
        @drop.prevent="onDrop"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
      >
        <div class="tape-icon">📼</div>
        <div class="upload-label">Scan your mixtape</div>
        <div class="upload-sub">Tap to take a photo or upload an image</div>
      </div>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFile" />

      <div v-if="!spotifyConnected" class="banner info" style="margin-top: 16px">
        Connect Spotify in Settings to create playlists after scanning.
      </div>
    </template>

    <!-- Step: preview -->
    <template v-else-if="step === 'preview'">
      <div class="preview-wrap">
        <img :src="imageUrl" class="preview-img" alt="Mixtape" />
        <button class="reset-btn" @click="reset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="action-pad">
        <button class="btn-primary" :disabled="analyzing" @click="analyze">
          <svg v-if="!analyzing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="8"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {{ analyzing ? 'Reading your tape…' : 'Identify Songs' }}
        </button>
        <div v-if="analyzeError" class="banner error">{{ analyzeError }}</div>
      </div>
    </template>

    <!-- Step: results -->
    <template v-else-if="step === 'results'">
      <div class="preview-thumb-wrap">
        <img :src="imageUrl" class="preview-thumb" alt="" />
        <div class="preview-thumb-info">
          <div class="thumb-title">{{ tracks.length }} tracks found</div>
          <div class="thumb-sub">{{ matchedCount }} matched on Spotify</div>
        </div>
        <button class="reset-btn small" @click="reset">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="track-list">
        <div
          v-for="(track, i) in tracks"
          :key="i"
          class="track-item"
          :class="{ excluded: !track.included }"
          @click="track.included = !track.included"
        >
          <div class="checkbox" :class="{ checked: track.included }">
            <svg v-if="track.included" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div class="track-body">
            <div class="track-raw">
              <span class="track-artist-raw">{{ track.artist || '—' }}</span>
              <span class="track-dot">·</span>
              <span class="track-title-raw">{{ track.title }}</span>
            </div>

            <!-- Searching -->
            <div v-if="track.status === 'searching'" class="track-meta searching">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Searching Spotify…
            </div>

            <!-- Found -->
            <div v-else-if="track.status === 'found'" class="track-match">
              <img
                v-if="track.match.album?.images?.length"
                :src="track.match.album.images[track.match.album.images.length - 1].url"
                class="album-art"
                alt=""
              />
              <div class="match-text">
                <div class="match-name">{{ track.match.name }}</div>
                <div class="match-artist">{{ track.match.artists.map(a => a.name).join(', ') }}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" class="found-icon">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>

            <!-- Not found -->
            <div v-else-if="track.status === 'not_found'" class="not-found-section" @click.stop>
              <div class="track-meta not-found">Not found on Spotify</div>

              <button
                v-if="!track.manualSearch"
                class="manual-search-btn"
                @click.stop="openManualSearch(i)"
              >
                Search manually
              </button>

              <div v-else class="manual-search-box" @click.stop>
                <div class="manual-input-wrap">
                  <input
                    v-model="track.manualQuery"
                    type="text"
                    placeholder="Search Spotify…"
                    class="manual-input"
                    :ref="el => { if (el) el.focus() }"
                    @input="debouncedSearch(i)"
                    @keydown.escape.stop="track.manualSearch = false"
                  />
                  <button class="manual-close" @click.stop="track.manualSearch = false">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <div v-if="track.manualSearching" class="manual-results-wrap">
                  <div class="manual-status">Searching…</div>
                </div>

                <div v-else-if="track.manualResults.length" class="manual-results-wrap">
                  <div
                    v-for="result in track.manualResults"
                    :key="result.id"
                    class="manual-result"
                    @click.stop="selectResult(i, result)"
                  >
                    <img
                      v-if="result.album?.images?.length"
                      :src="result.album.images[result.album.images.length - 1].url"
                      class="result-art"
                      alt=""
                    />
                    <div class="result-text">
                      <div class="result-name">{{ result.name }}</div>
                      <div class="result-artist">{{ result.artists.map(a => a.name).join(', ') }}</div>
                    </div>
                  </div>
                </div>

                <div v-else-if="track.manualQuery.length > 1" class="manual-results-wrap">
                  <div class="manual-status">No results</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create playlist -->
      <div class="playlist-section">
        <div class="field">
          <label>Playlist name</label>
          <input v-model="playlistName" type="text" placeholder="My Mixtape" />
        </div>

        <template v-if="!spotifyConnected">
          <div class="banner info">
            <RouterLink to="/settings">Connect Spotify</RouterLink> to create a playlist.
          </div>
        </template>

        <template v-else>
          <button
            class="btn-primary"
            :disabled="creating || selectedMatchedCount === 0 || searching"
            @click="doCreatePlaylist"
          >
            <svg v-if="!creating" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {{ creating ? 'Creating playlist…' : `Add ${selectedMatchedCount} track${selectedMatchedCount === 1 ? '' : 's'} to Spotify` }}
          </button>
          <p v-if="searching" class="hint" style="text-align:center; padding-top: 8px">
            Matching {{ matchedCount + notFoundCount }} of {{ tracks.length }}…
          </p>
        </template>

        <div v-if="playlistError" class="banner error">{{ playlistError }}</div>
        <div v-if="playlistUrl" class="banner success">
          Playlist created! <a :href="playlistUrl" target="_blank" rel="noopener">Open in Spotify →</a>
        </div>
      </div>

      <button class="scan-again" @click="reset">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        Scan another tape
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { isLoggedIn, searchTrack, searchTracks, createPlaylist } from '../spotify.js'
import { saveScan } from '../history.js'

const step = ref('upload')
const fileInput = ref(null)
const imageUrl = ref('')
const imageBlob = ref(null)
const dragging = ref(false)
const analyzing = ref(false)
const analyzeError = ref('')
const tracks = ref([])
const searching = ref(false)
const playlistName = ref('My Mixtape')
const creating = ref(false)
const playlistError = ref('')
const playlistUrl = ref('')

const searchTimers = new Map()

const spotifyConnected = computed(() => isLoggedIn())

const stepLabel = computed(() => {
  if (step.value === 'preview') return 'Ready to scan'
  if (step.value === 'results') return `${tracks.value.length} tracks found`
  return ''
})

const matchedCount = computed(() => tracks.value.filter(t => t.status === 'found').length)
const notFoundCount = computed(() => tracks.value.filter(t => t.status === 'not_found').length)
const selectedMatchedCount = computed(() =>
  tracks.value.filter(t => t.included && t.status === 'found').length
)

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file?.type.startsWith('image/')) loadFile(file)
}

function onFile(e) {
  const file = e.target.files?.[0]
  if (file) loadFile(file)
  e.target.value = ''
}

function loadFile(file) {
  imageBlob.value = file
  imageUrl.value = URL.createObjectURL(file)
  step.value = 'preview'
  analyzeError.value = ''
}

async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const maxDim = 1120
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim }
        else { width = Math.round(width * maxDim / height); height = maxDim }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(resolve, 'image/jpeg', 0.88)
    }
    img.src = URL.createObjectURL(file)
  })
}

async function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
}

async function analyze() {
  analyzeError.value = ''
  analyzing.value = true
  try {
    const compressed = await compressImage(imageBlob.value)
    const b64 = await blobToBase64(compressed)
    const resp = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, mimeType: 'image/jpeg' })
    })
    if (!resp.ok) throw new Error(`Server error ${resp.status}`)
    const { tracks: found, error } = await resp.json()
    if (error) throw new Error(error)
    if (!found?.length) throw new Error('No tracks detected. Try a clearer photo.')

    tracks.value = found.map(t => ({
      artist: t.artist || '',
      title: t.title || '',
      status: 'searching',
      match: null,
      included: true,
      manualSearch: false,
      manualQuery: '',
      manualResults: [],
      manualSearching: false
    }))

    step.value = 'results'
    playlistName.value = 'My Mixtape'
    playlistUrl.value = ''
    playlistError.value = ''
    matchTracks()
  } catch (e) {
    analyzeError.value = e.message
  } finally {
    analyzing.value = false
  }
}

async function matchTracks() {
  searching.value = true
  for (const track of tracks.value) {
    try {
      const result = await searchTrack(track.artist, track.title)
      track.status = result ? 'found' : 'not_found'
      track.match = result
      if (!result) track.included = false
    } catch {
      track.status = 'not_found'
      track.included = false
    }
    await new Promise(r => setTimeout(r, 120))
  }
  searching.value = false
}

function openManualSearch(i) {
  const track = tracks.value[i]
  track.manualSearch = true
  track.manualQuery = [track.artist, track.title].filter(Boolean).join(' ')
  if (track.manualQuery) debouncedSearch(i)
}

function debouncedSearch(i) {
  clearTimeout(searchTimers.get(i))
  searchTimers.set(i, setTimeout(() => doManualSearch(i), 380))
}

async function doManualSearch(i) {
  const track = tracks.value[i]
  if (!track.manualQuery.trim()) { track.manualResults = []; return }
  track.manualSearching = true
  try {
    track.manualResults = await searchTracks(track.manualQuery)
  } catch {
    track.manualResults = []
  } finally {
    track.manualSearching = false
  }
}

function selectResult(i, result) {
  const track = tracks.value[i]
  track.match = result
  track.status = 'found'
  track.included = true
  track.manualSearch = false
  track.manualQuery = ''
  track.manualResults = []
}

async function doCreatePlaylist() {
  playlistError.value = ''
  playlistUrl.value = ''
  creating.value = true
  try {
    const matched = tracks.value.filter(t => t.included && t.status === 'found')
    const playlist = await createPlaylist(playlistName.value || 'My Mixtape', matched.map(t => t.match.uri))
    playlistUrl.value = playlist.external_urls?.spotify || ''
    saveScan({
      playlistName: playlistName.value || 'My Mixtape',
      playlistUrl: playlistUrl.value,
      trackCount: tracks.value.length,
      matchedCount: matched.length,
      tracks: matched.map(t => ({
        artist: t.artist,
        title: t.title,
        matchName: t.match.name,
        matchArtist: t.match.artists.map(a => a.name).join(', ')
      }))
    })
  } catch (e) {
    playlistError.value = e.message
  } finally {
    creating.value = false
  }
}

function reset() {
  step.value = 'upload'
  imageUrl.value = ''
  imageBlob.value = null
  tracks.value = []
  analyzeError.value = ''
  playlistError.value = ''
  playlistUrl.value = ''
  searching.value = false
  searchTimers.clear()
}
</script>

<style scoped>
.upload-zone {
  margin: 24px 16px;
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.upload-zone:active, .upload-zone.dragging {
  border-color: var(--accent);
  background: rgba(29, 185, 84, 0.05);
}

.tape-icon { font-size: 52px; line-height: 1; }
.upload-label { font-size: 17px; font-weight: 600; }
.upload-sub { font-size: 13px; color: var(--text-sub); text-align: center; line-height: 1.5; }

.preview-wrap { position: relative; margin: 16px; }

.preview-img {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 12px;
  background: var(--surface);
  display: block;
}

.reset-btn {
  position: absolute;
  top: 8px; right: 8px;
  background: rgba(15, 15, 19, 0.8);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 50%;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.reset-btn.small { width: 26px; height: 26px; }

.action-pad { padding: 0 16px 16px; }

.preview-thumb-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.preview-thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.preview-thumb-info { flex: 1; min-width: 0; }
.thumb-title { font-weight: 600; font-size: 15px; }
.thumb-sub { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

.track-list { padding: 8px 0; }

.track-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.track-item:active { background: var(--surface); }
.track-item.excluded { opacity: 0.45; }

.checkbox {
  width: 20px; height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  flex-shrink: 0;
  margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}

.checkbox.checked { background: var(--accent); border-color: var(--accent); color: #000; }

.track-body { flex: 1; min-width: 0; }

.track-raw {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.track-artist-raw { font-weight: 600; }
.track-dot { color: var(--text-sub); margin: 0 5px; }
.track-title-raw { color: var(--text-sub); }

.track-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  margin-top: 4px;
  color: var(--text-sub);
}

.track-match {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

.album-art { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
.match-text { flex: 1; min-width: 0; }
.match-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.match-artist { font-size: 11px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.found-icon { flex-shrink: 0; }

/* Manual search */
.not-found-section { margin-top: 4px; }

.manual-search-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 12px;
  padding: 2px 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.manual-search-box { margin-top: 6px; }

.manual-input-wrap {
  display: flex;
  align-items: center;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 8px 0 10px;
  gap: 6px;
}

.manual-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13px;
  padding: 8px 0;
}

.manual-input::placeholder { color: var(--text-sub); }

.manual-close {
  background: none;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.manual-results-wrap {
  margin-top: 4px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.manual-status {
  font-size: 12px;
  color: var(--text-sub);
  padding: 10px 12px;
}

.manual-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
}

.manual-result:last-child { border-bottom: none; }
.manual-result:active { background: var(--surface); }

.result-art { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
.result-text { flex: 1; min-width: 0; }
.result-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-artist { font-size: 11px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Playlist section */
.playlist-section {
  padding: 16px;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}

.scan-again {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: calc(100% - 32px);
  margin: 16px 16px 8px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-sub);
  border-radius: var(--radius);
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.scan-again:hover { border-color: var(--accent); color: var(--accent); }
</style>
