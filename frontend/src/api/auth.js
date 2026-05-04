import axios from 'axios'
import api from './client'

export const login = async (username, password) => {
  const { data } = await axios.post('/api/token/', { username, password })
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  return data
}

export const register = async (username, email, password) => {
  const { data } = await axios.post('/api/auth/register/', { username, email, password })
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  return data
}

export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export const getMe = () => api.get('/users/me/')
export const updateMe = (data) => api.patch('/users/me/', data)
export const updateAvatar = (formData) =>
  api.patch('/users/me/avatar/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
