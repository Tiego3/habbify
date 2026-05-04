import { create } from 'zustand'
import { getMe } from '../api/auth'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { set({ loading: false }); return }
    try {
      const { data } = await getMe()
      set({ user: data, loading: false })
      get().applyTheme(data.profile?.theme || 'light')
    } catch {
      set({ loading: false })
    }
  },

  setUser: (user) => {
    set({ user })
    get().applyTheme(user?.profile?.theme || 'light')
  },

  applyTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null })
    document.documentElement.removeAttribute('data-theme')
  },
}))
