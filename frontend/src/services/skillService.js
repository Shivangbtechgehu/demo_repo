import apiClient from './apiClient'

const extractApiError = (error, fallback) =>
  error?.response?.data?.error?.message || fallback

export const getSkills = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search)           query.append('search',           params.search)
  if (params.category)         query.append('category',         params.category)
  if (params.proficiencyLevel) query.append('proficiencyLevel', params.proficiencyLevel)
  if (params.sortBy)           query.append('sortBy',           params.sortBy)
  if (params.sortOrder)        query.append('sortOrder',        params.sortOrder)
  if (params.page)             query.append('page',             params.page)
  if (params.limit)            query.append('limit',            params.limit)

  const res = await apiClient.get(`/v1/skill?${query.toString()}`)
  return { items: res.data.data.skills, meta: res.data.meta }
}

export const addSkill = async (payload) => {
  try {
    const res = await apiClient.post('/v1/skill', payload)
    return res.data.data.skill
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to add skill.'))
  }
}

export const updateSkill = async (id, payload) => {
  try {
    const res = await apiClient.patch(`/v1/skill/${id}`, payload)
    return res.data.data.skill
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to update skill.'))
  }
}

export const mapSkillToGoal = async (skillId, goalId) => {
  try {
    const res = await apiClient.post(`/v1/skill/${skillId}/map-goal`, { goalId })
    return res.data.data.skill
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to map skill to goal.'))
  }
}
