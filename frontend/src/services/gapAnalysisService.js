import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const generateGapAnalysis = async (goalId) => {
  try {
    const res = await apiClient.post('/v1/gap-analysis', { goalId })
    return res.data.data.analysis
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to generate gap analysis.'))
  }
}

export const getGapAnalysis = async (goalId) => {
  const res = await apiClient.get(`/v1/gap-analysis/${goalId}`)
  return res.data.data.analysis
}
