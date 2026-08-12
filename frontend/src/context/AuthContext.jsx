import { createContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AUTH_STORAGE_KEY } from '../constants'
import {
  getProfile,
  login as loginRequest,
  register as registerRequest,
  verifyRegisterOtp as verifyRegisterOtpRequest,
  verifyLoginOtp as verifyLoginOtpRequest,
} from '../services/authService'
import { getStoredItem, removeStoredItem, setStoredItem } from '../utils/storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredItem(AUTH_STORAGE_KEY, null)?.user ?? null)
  const [token, setToken] = useState(() => getStoredItem(AUTH_STORAGE_KEY, null)?.token ?? null)
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredItem(AUTH_STORAGE_KEY, null)?.token))

  useEffect(() => {
    const handleUnauthorized = () => logout(false)
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    const hydrateProfile = async () => {
      if (!token || user) return
      setIsLoading(true)
      try {
        const data = await getProfile()
        persistAuth(data.user, token)
      } catch {
        logout(false)
      } finally {
        setIsLoading(false)
      }
    }
    hydrateProfile()
  }, [token, user])

  const persistAuth = (nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)
    setStoredItem(AUTH_STORAGE_KEY, { user: nextUser, token: nextToken })
  }

  // Step 1 — only sends OTP, no token yet
  const register = async (payload) => {
    setIsLoading(true)
    try {
      const data = await registerRequest(payload)
      return data // { message }
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 — verifies OTP, gets token + user
  const verifyRegisterOtp = async (payload) => {
    setIsLoading(true)
    try {
      const data = await verifyRegisterOtpRequest(payload)
      persistAuth(data.user, data.token)
      toast.success('Email verified! Welcome 🎉')
      return data
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1 — only sends OTP, no token yet
  const login = async (payload) => {
    setIsLoading(true)
    try {
      const data = await loginRequest(payload)
      return data // { message }
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 — verifies OTP, gets token + user
  const verifyLoginOtp = async (payload) => {
    setIsLoading(true)
    try {
      const data = await verifyLoginOtpRequest(payload)
      persistAuth(data.user, data.token)
      toast.success('Logged in successfully')
      return data
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (showToast = true) => {
    setUser(null)
    setToken(null)
    removeStoredItem(AUTH_STORAGE_KEY)
    if (showToast) toast.success('Logged out')
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    register,
    verifyRegisterOtp,
    login,
    verifyLoginOtp,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
