import axios from 'axios'
import { API_TIMEOUT, AUTH_STORAGE_KEY } from '../constants'
import { getStoredItem } from '../utils/storage'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const auth = getStoredItem(AUTH_STORAGE_KEY, null)

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    return Promise.reject(error)
  },
)

export default apiClient
