import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/tasks', label: 'Tasks', icon: '✓' },
  { to: '/habits', label: 'Habits', icon: '○' },
  { to: '/insights', label: 'Insights', icon: '≋' },
  { to: '/chat', label: 'AI Coach', icon: '✦' },
  { to: '/calendar', label: 'Calendar', icon: '⊟' },
]

function UserAvatar({ user, size = 36 }) {
  const profile = user?.profile
  const displayName = profile?.display_name || user?.username || '?'
  const initial = displayName.charAt(0).toUpperCase()

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={displayName}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center font-semibold text-sm"
      style={{ width: size, height: size, background: '#C5D8C3', color: '#2C3329' }}
    >
      {initial}
    </div>
  )
}

export default function Sidebar() {
  const { logout, user } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  const displayName = user?.profile?.display_name || user?.username || ''
  const truncated = displayName.length > 18 ? displayName.slice(0, 18) + '…' : displayName

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <aside
      className="hidden md:flex flex-col w-56 min-h-screen border-r px-3 py-6 shrink-0"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="px-2 mb-8">
        <span className="font-display text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
          Habbify
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'border-l-2 pl-[10px]' : 'hover:bg-[var(--color-border)]'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
              borderColor: isActive ? 'var(--color-accent)' : 'transparent',
            })}
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User block */}
      <div ref={dropRef} className="mt-auto relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md transition-colors hover:bg-[var(--color-border)]"
        >
          <UserAvatar user={user} size={36} />
          <span
            className="flex-1 text-sm font-medium text-left truncate"
            style={{ color: 'var(--color-text)' }}
          >
            {truncated}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>▾</span>
        </button>

        {open && (
          <div
            className="absolute bottom-full left-0 right-0 mb-1 rounded-md border py-1 z-50 shadow-lg"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => { navigate('/profile'); setOpen(false) }}
              className="w-full text-left text-sm px-4 py-2 transition-colors hover:bg-[var(--color-surface)]"
              style={{ color: 'var(--color-text)' }}
            >
              Profile settings
            </button>
            <button
              onClick={toggle}
              className="w-full text-left text-sm px-4 py-2 transition-colors hover:bg-[var(--color-surface)]"
              style={{ color: 'var(--color-text)' }}
            >
              {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
            </button>
            <hr style={{ borderColor: 'var(--color-border)', margin: '4px 0' }} />
            <button
              onClick={() => { logout(); setOpen(false) }}
              className="w-full text-left text-sm px-4 py-2 transition-colors hover:bg-[var(--color-surface)]"
              style={{ color: 'var(--color-danger)' }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
