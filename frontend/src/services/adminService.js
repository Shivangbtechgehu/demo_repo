import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const getDashboardStats = async () => {
  const res = await apiClient.get('/v1/admin/dashboard')
  return res.data.data
}

export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.role)  params.append('role',  filters.role)
  if (filters.email) params.append('email', filters.email)
  if (filters.page)  params.append('page',  filters.page)
  if (filters.limit) params.append('limit', filters.limit)
  const res = await apiClient.get(`/v1/admin/users?${params.toString()}`)
  return res.data.data
}

export const updateUserRole = async (id, role) => {
  try {
    const res = await apiClient.patch(`/v1/admin/users/${id}/role`, { role })
    return res.data.data.user
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to update role.'))
  }
}

export const deleteUser = async (id) => {
  try {
    await apiClient.delete(`/v1/admin/users/${id}`)
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to delete user.'))
  }
}
