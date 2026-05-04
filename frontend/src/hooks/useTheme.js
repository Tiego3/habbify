import { useAuthStore } from '../store'
import { updateMe } from '../api/auth'

export const useTheme = () => {
  const { user, setUser, applyTheme } = useAuthStore()
  const theme = user?.profile?.theme || 'light'

  const toggle = async () => {
    const next = theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    try {
      const { data } = await updateMe({ profile: { theme: next } })
      setUser(data)
    } catch {
      applyTheme(theme) // revert on error
    }
  }

  return { theme, toggle }
}
