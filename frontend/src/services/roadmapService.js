import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const getRoadmaps = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search)    query.append('search',    params.search)
  if (params.status)    query.append('status',    params.status)
  if (params.sortBy)    query.append('sortBy',    params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page)      query.append('page',      params.page)
  if (params.limit)     query.append('limit',     params.limit)

  const res = await apiClient.get(`/v1/roadmap?${query.toString()}`)
  return { items: res.data.data.roadmaps, meta: res.data.meta }
}

export const getRoadmapById = async (id) => {
  const res = await apiClient.get(`/v1/roadmap/${id}`)
  return res.data.data.roadmap
}

export const generateRoadmap = async (goalId) => {
  try {
    const res = await apiClient.post('/v1/roadmap', { goalId })
    return res.data.data.roadmap
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to generate roadmap.'))
  }
}
