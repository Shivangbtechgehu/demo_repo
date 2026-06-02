import apiClient from './apiClient'

const mockDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

const createMockUser = (payload) => ({
  id: crypto.randomUUID(),
  name: payload.name || 'Demo User',
  email: payload.email,
})

export const login = async (payload) => {
  await mockDelay()

  if (!payload.email || !payload.password) {
    throw new Error('Email and password are required.')
  }

  return {
    user: createMockUser(payload),
    token: 'demo-token',
  }
}

export const register = async (payload) => {
  await mockDelay()

  if (!payload.name || !payload.email || !payload.password) {
    throw new Error('All fields are required.')
  }

  return {
    user: createMockUser(payload),
    token: 'demo-token',
  }
}

export const getProfile = async () => {
  const response = await apiClient.get('/me')
  return response.data
}
