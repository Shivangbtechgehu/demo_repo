import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

// ── Projects ──────────────────────────────────────────────────────────────────

export const getProjects = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search)    query.append('search',    params.search)
  if (params.status)    query.append('status',    params.status)
  if (params.sortBy)    query.append('sortBy',    params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page)      query.append('page',      params.page)
  if (params.limit)     query.append('limit',     params.limit)

  const res = await apiClient.get(`/v1/projects?${query.toString()}`)
  return { items: res.data.data.projects, meta: res.data.meta }
}

export const getProjectById = async (id) => {
  const res = await apiClient.get(`/v1/projects/${id}`)
  return res.data.data.project
}

export const createProject = async (payload) => {
  try {
    const res = await apiClient.post('/v1/projects', payload)
    return res.data.data.project
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to create project.'))
  }
}

export const updateProject = async (id, payload) => {
  try {
    const res = await apiClient.patch(`/v1/projects/${id}`, payload)
    return res.data.data.project
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to update project.'))
  }
}

export const deleteProject = async (id) => {
  try {
    await apiClient.delete(`/v1/projects/${id}`)
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to delete project.'))
  }
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const addTask = async (projectId, payload) => {
  try {
    const res = await apiClient.post(`/v1/projects/${projectId}/tasks`, payload)
    return res.data.data.project
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to add task.'))
  }
}

export const updateTask = async (projectId, taskId, payload) => {
  try {
    const res = await apiClient.patch(`/v1/tasks/${projectId}/${taskId}`, payload)
    return res.data.data.project
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to update task.'))
  }
}

export const deleteTask = async (projectId, taskId) => {
  try {
    const res = await apiClient.delete(`/v1/tasks/${projectId}/${taskId}`)
    return res.data.data.project
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to delete task.'))
  }
}
