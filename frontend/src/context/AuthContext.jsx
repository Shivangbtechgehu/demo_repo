import { createContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AUTH_STORAGE_KEY } from '../constants'
import { login as loginRequest, register as registerRequest } from '../services/authService'
import { getStoredItem, removeStoredItem, setStoredItem } from '../utils/storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredItem(AUTH_STORAGE_KEY, null)?.user ?? null)
  const [token, setToken] = useState(() => getStoredItem(AUTH_STORAGE_KEY, null)?.token ?? null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleUnauthorized = () => logout(false)
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const persistAuth = (nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)
    setStoredItem(AUTH_STORAGE_KEY, {
      user: nextUser,
      token: nextToken,
    })
  }

  const login = async (payload) => {
    setIsLoading(true)

    try {
      const data = await loginRequest(payload)
      persistAuth(data.user, data.token)
      toast.success('Logged in successfully')
      return data
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload) => {
    setIsLoading(true)

    try {
      const data = await registerRequest(payload)
      persistAuth(data.user, data.token)
      toast.success('Account created successfully')
      return data
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (showToast = true) => {
    setUser(null)
    setToken(null)
    removeStoredItem(AUTH_STORAGE_KEY)

    if (showToast) {
      toast.success('Logged out')
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
