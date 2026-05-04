import api from './client'

export const getTasks = (params) => api.get('/tasks/', { params })
export const getTask = (id) => api.get(`/tasks/${id}/`)
export const createTask = (data) => api.post('/tasks/', data)
export const updateTask = (id, data) => api.patch(`/tasks/${id}/`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}/`)
export const completeTask = (id) => api.post(`/tasks/${id}/complete/`)
export const restoreTask = (id) => api.post(`/tasks/${id}/restore/`)

export const bulkComplete = (ids) => api.post('/tasks/bulk-complete/', { ids })
export const bulkDelete = (ids) => api.post('/tasks/bulk-delete/', { ids })
export const bulkReschedule = (ids, due_date) =>
  api.post('/tasks/bulk-reschedule/', { ids, due_date })

export const getTags = () => api.get('/tags/')
export const createTag = (data) => api.post('/tags/', data)
