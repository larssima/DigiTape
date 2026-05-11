const KEY = 'digitape_history'
const MAX = 50

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

export function saveScan(scan) {
  const history = getHistory()
  history.unshift({ ...scan, id: Date.now(), date: new Date().toISOString() })
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, MAX)))
}

export function deleteScan(id) {
  localStorage.setItem(KEY, JSON.stringify(getHistory().filter(s => s.id !== id)))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}
