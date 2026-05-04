import api from './client'

export const getCalendarData = (month) => api.get('/calendar/', { params: { month } })
