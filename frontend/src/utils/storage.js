export const getStoredItem = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const setStoredItem = (key, value) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const removeStoredItem = (key) => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}
