import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const tabs = [
  { to: '/dashboard', label: 'Home', icon: '⊞' },
  { to: '/tasks', label: 'Tasks', icon: '✓' },
  { to: '/habits', label: 'Habits', icon: '○' },
  { to: '/insights', label: 'Insights', icon: '≋' },
  { to: '/chat', label: 'AI', icon: '✦' },
  { to: '/calendar', label: 'Cal', icon: '⊟' },
]

function UserAvatarSmall({ user }) {
  const profile = user?.profile
  const displayName = profile?.display_name || user?.username || '?'
  const initial = displayName.charAt(0).toUpperCase()

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={displayName}
        className="rounded-full object-cover"
        style={{ width: 24, height: 24 }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-xs"
      style={{ width: 24, height: 24, background: '#C5D8C3', color: '#2C3329' }}
    >
      {initial}
    </div>
  )
}

export default function BottomNav() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 border-t z-40"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* User dropdown sheet — slides up from nav */}
      {showMenu && (
        <div className="border-t py-1" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => { navigate('/profile'); setShowMenu(false) }}
            className="w-full text-left text-sm px-5 py-2.5 transition-colors hover:bg-[var(--color-border)]"
            style={{ color: 'var(--color-text)' }}
          >
            Profile settings
          </button>
          <button
            onClick={toggle}
            className="w-full text-left text-sm px-5 py-2.5 transition-colors hover:bg-[var(--color-border)]"
            style={{ color: 'var(--color-text)' }}
          >
            {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
          </button>
          <button
            onClick={() => { logout(); setShowMenu(false) }}
            className="w-full text-left text-sm px-5 py-2.5 transition-colors hover:bg-[var(--color-border)]"
            style={{ color: 'var(--color-danger)' }}
          >
            Sign out
          </button>
        </div>
      )}

      <div className="flex">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className="flex-1 flex flex-col items-center py-2 text-xs gap-0.5"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
            })}
          >
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
        {/* User avatar tab */}
        <button
          onClick={() => setShowMenu(v => !v)}
          className="flex-1 flex flex-col items-center py-2 text-xs gap-0.5"
          style={{ color: showMenu ? 'var(--color-accent)' : 'var(--color-muted)' }}
        >
          <UserAvatarSmall user={user} />
          <span>Me</span>
        </button>
      </div>
    </nav>
  )
}
