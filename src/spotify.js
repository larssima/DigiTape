const SCOPES = 'playlist-modify-public playlist-modify-private user-read-private user-read-email'

function getClientId() {
  return localStorage.getItem('spotify_client_id') || ''
}

function getRedirectUri() {
  return window.location.origin + '/callback'
}

function generateVerifier() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function login(clientId) {
  if (clientId) localStorage.setItem('spotify_client_id', clientId)
  const verifier = generateVerifier()
  localStorage.setItem('spotify_verifier', verifier)
  const challenge = await generateChallenge(verifier)

  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge
  })
  window.location.href = 'https://accounts.spotify.com/authorize?' + params
}

export async function handleCallback(code) {
  const verifier = localStorage.getItem('spotify_verifier')
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getClientId(),
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier
    })
  })
  const data = await resp.json()
  if (data.access_token) {
    localStorage.setItem('spotify_access_token', data.access_token)
    localStorage.setItem('spotify_refresh_token', data.refresh_token || '')
    localStorage.setItem('spotify_expires_at', String(Date.now() + data.expires_in * 1000))
    return true
  }
  return false
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem('spotify_refresh_token')
  if (!refresh) return false
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getClientId(),
      grant_type: 'refresh_token',
      refresh_token: refresh
    })
  })
  const data = await resp.json()
  if (data.access_token) {
    localStorage.setItem('spotify_access_token', data.access_token)
    localStorage.setItem('spotify_expires_at', String(Date.now() + data.expires_in * 1000))
    if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token)
    return true
  }
  return false
}

async function getToken() {
  const expiresAt = Number(localStorage.getItem('spotify_expires_at') || 0)
  if (Date.now() > expiresAt - 60_000) {
    await refreshAccessToken()
  }
  return localStorage.getItem('spotify_access_token')
}

export function isLoggedIn() {
  return !!localStorage.getItem('spotify_access_token')
}

export function logout() {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_refresh_token')
  localStorage.removeItem('spotify_expires_at')
  localStorage.removeItem('spotify_verifier')
}

async function apiFetch(url, options = {}) {
  const token = await getToken()
  const resp = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  if (resp.status === 204) return null
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `Spotify ${resp.status}`)
  }
  return resp.json()
}

export async function getMe() {
  return apiFetch('https://api.spotify.com/v1/me')
}

export async function searchTrack(artist, title) {
  const q = artist ? `track:${title} artist:${artist}` : title
  const data = await apiFetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1`
  )
  return data?.tracks?.items?.[0] ?? null
}

export async function createPlaylist(name, trackUris) {
  const me = await getMe()
  const playlist = await apiFetch(
    `https://api.spotify.com/v1/users/${me.id}/playlists`,
    {
      method: 'POST',
      body: JSON.stringify({ name, description: 'Created by DigiTape 📼', public: false })
    }
  )
  for (let i = 0; i < trackUris.length; i += 100) {
    await apiFetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris: trackUris.slice(i, i + 100) })
    })
  }
  return playlist
}
