import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const getMyProfile = async () => {
  const res = await apiClient.get('/v1/profile/me')
  return res.data.data.profile
}

export const upsertProfile = async (payload) => {
  try {
    const res = await apiClient.post('/v1/profile', payload)
    return res.data.data.profile
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to save profile.'))
  }
}

export const patchProfile = async (payload) => {
  try {
    const res = await apiClient.patch('/v1/profile/me', payload)
    return res.data.data.profile
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to update profile.'))
  }
}
