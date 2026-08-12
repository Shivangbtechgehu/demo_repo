import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const initializeProgress = async (roadmapId) => {
  try {
    const res = await apiClient.post('/v1/progress', { roadmapId })
    return res.data.data.progress
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to initialize progress.'))
  }
}

export const getProgressByRoadmap = async (roadmapId) => {
  const res = await apiClient.get(`/v1/progress/${roadmapId}`)
  return res.data.data.progress
}

export const getAllProgress = async () => {
  const res = await apiClient.get('/v1/progress')
  return res.data.data.progress
}

export const updateMilestone = async (roadmapId, stepOrder, completed) => {
  try {
    const res = await apiClient.patch(`/v1/progress/${roadmapId}/steps/${stepOrder}`, { completed })
    return res.data.data.progress
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to update milestone.'))
  }
}

export const resetProgress = async (roadmapId) => {
  try {
    const res = await apiClient.delete(`/v1/progress/${roadmapId}/reset`)
    return res.data.data.progress
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to reset progress.'))
  }
}
