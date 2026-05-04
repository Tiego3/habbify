import api from './client'

export const getHabits = (params) => api.get('/habits/', { params })
export const getHabit = (id) => api.get(`/habits/${id}/`)
export const createHabit = (data) => api.post('/habits/', data)
export const updateHabit = (id, data) => api.patch(`/habits/${id}/`, data)
export const deleteHabit = (id) => api.delete(`/habits/${id}/`)
export const logHabit = (id, data) => api.post(`/habits/${id}/log/`, data)
export const getHabitStats = (id) => api.get(`/habits/${id}/stats/`)

export const getInsights = (timeframe = 'week') =>
  api.get('/insights/', { params: { timeframe } })
