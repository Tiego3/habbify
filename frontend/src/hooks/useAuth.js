import { useAuthStore } from '../store'

export const useAuth = () => {
  const { user, loading, setUser, logout } = useAuthStore()
  return { user, loading, setUser, logout, isAuthenticated: !!user }
}
