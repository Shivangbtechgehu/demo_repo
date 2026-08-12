import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const getGoals = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search)    query.append('search',    params.search)
  if (params.status)    query.append('status',    params.status)
  if (params.priority)  query.append('priority',  params.priority)
  if (params.sortBy)    query.append('sortBy',    params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page)      query.append('page',      params.page)
  if (params.limit)     query.append('limit',     params.limit)

  const res = await apiClient.get(`/v1/careergoal?${query.toString()}`)
  return { items: res.data.data.goals, meta: res.data.meta }
}

export const getGoalById = async (id) => {
  const res = await apiClient.get(`/v1/careergoal/${id}`)
  return res.data.data.goal
}

export const createGoal = async (payload) => {
  try {
    const res = await apiClient.post('/v1/careergoal', payload)
    return res.data.data.goal
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to create goal.'))
  }
}

export const updateGoal = async (id, payload) => {
  try {
    const res = await apiClient.patch(`/v1/careergoal/${id}`, payload)
    return res.data.data.goal
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to update goal.'))
  }
}

export const deleteGoal = async (id) => {
  try {
    await apiClient.delete(`/v1/careergoal/${id}`)
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to delete goal.'))
  }
}
