import apiClient from './apiClient'

const extractApiError = (error, fallbackMessage) => {
  return error?.response?.data?.error?.message || fallbackMessage
}

// Step 1 of register — sends OTP, no token returned
export const register = async (payload) => {
  try {
    const response = await apiClient.post('/v1/auth/register', payload)
    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to register.'))
  }
}

// Step 2 of register — verify OTP, returns token + user
export const verifyRegisterOtp = async (payload) => {
  try {
    const response = await apiClient.post('/v1/auth/verify-register-otp', payload)
    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to verify OTP.'))
  }
}

// Step 1 of login — sends OTP, no token returned
export const login = async (payload) => {
  try {
    const response = await apiClient.post('/v1/auth/login', payload)
    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to log in.'))
  }
}

// Step 2 of login — verify OTP, returns token + user
export const verifyLoginOtp = async (payload) => {
  try {
    const response = await apiClient.post('/v1/auth/verify-login-otp', payload)
    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to verify OTP.'))
  }
}

export const getProfile = async () => {
  const response = await apiClient.get('/v1/auth/me')
  return response.data.data
}
