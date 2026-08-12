import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const getReviewsByRoadmap = async (roadmapId) => {
  const res = await apiClient.get(`/v1/mentor-reviews/${roadmapId}`)
  return res.data.data.reviews
}

export const createReview = async (payload) => {
  try {
    const res = await apiClient.post('/v1/mentor-reviews', payload)
    return res.data.data.review
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to submit review.'))
  }
}

export const updateReview = async (id, payload) => {
  try {
    const res = await apiClient.patch(`/v1/mentor-reviews/${id}`, payload)
    return res.data.data.review
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to update review.'))
  }
}

export const getMentorDashboard = async () => {
  const res = await apiClient.get('/v1/mentor-reviews/dashboard')
  return res.data.data.reviews
}

export const getAllReviews = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.status)    params.append('status',    filters.status)
  if (filters.mentorId)  params.append('mentorId',  filters.mentorId)
  if (filters.studentId) params.append('studentId', filters.studentId)
  const res = await apiClient.get(`/v1/mentor-reviews/admin/all?${params.toString()}`)
  return res.data.data.reviews
}
