import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.type)      query.append('type',      params.type)
  if (params.read !== undefined && params.read !== '') query.append('read', params.read)
  if (params.sortBy)    query.append('sortBy',    params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page)      query.append('page',      params.page)
  if (params.limit)     query.append('limit',     params.limit)

  const res = await apiClient.get(`/v1/notifications?${query.toString()}`)
  const d = res.data.data
  return { items: d.notifications, meta: res.data.meta, unreadCount: d.unreadCount }
}

export const markAsRead = async (id) => {
  try {
    const res = await apiClient.patch(`/v1/notifications/${id}/read`)
    return res.data.data.notification
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to mark notification as read.'))
  }
}

export const markAllAsRead = async () => {
  try {
    await apiClient.patch('/v1/notifications/read-all')
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to mark all as read.'))
  }
}

export const deleteNotification = async (id) => {
  try {
    await apiClient.delete(`/v1/notifications/${id}`)
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to delete notification.'))
  }
}
