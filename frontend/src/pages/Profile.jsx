import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { updateMe, updateAvatar } from '../api/auth'
import { useAuthStore } from '../store'

const ACCENT_PRESETS = [
  '#7D9B76', '#5E7D58', '#A8906A', '#8C7254',
  '#A0BC94', '#C4B090', '#384D34', '#54432F',
]

const GOALS = [
  'Build discipline', 'Improve health', 'Stay organized',
  'Learn consistently',
]

export default function Profile() {
  const { user } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const setUser = useAuthStore((s) => s.setUser)
  const profile = user?.profile || {}

  const [form, setForm] = useState({
    display_name: profile.display_name || '',
    zen_mode: profile.zen_mode || false,
    accent_color: profile.accent_color || '#7D9B76',
    goals: profile.goals || [],
    theme: profile.theme || 'light',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await updateMe({ profile: form })
      setUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('avatar', file)
    const { data } = await updateAvatar(fd)
    setUser(data)
  }

  const toggleGoal = (g) => {
    setForm(f => ({
      ...f,
      goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g],
    }))
  }

  const setAccent = (color) => {
    setForm(f => ({ ...f, accent_color: color }))
    document.documentElement.style.setProperty('--color-accent', color)
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <form onSubmit={save} className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)' }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl">◉</span>
              }
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
          <div>
            <p className="font-medium">{user?.username}</p>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="text-sm font-medium block mb-1">Display name</label>
          <input className="input" value={form.display_name}
            onChange={e => setForm({ ...form, display_name: e.target.value })}
            placeholder={user?.username} />
        </div>

        {/* Goals */}
        <div>
          <label className="text-sm font-medium block mb-2">Goals</label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map(g => (
              <button type="button" key={g} onClick={() => toggleGoal(g)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={form.goals.includes(g)
                  ? { background: 'var(--color-accent)', color: '#fff' }
                  : { background: 'var(--color-surface)', color: 'var(--color-muted)',
                      border: '1px solid var(--color-border)' }
                }>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className="text-sm font-medium block mb-2">Accent color</label>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_PRESETS.map(c => (
              <button type="button" key={c} onClick={() => setAccent(c)}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: form.accent_color === c ? 'var(--color-text)' : 'transparent',
                }}
                aria-label={`Accent color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Theme & Zen Mode */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Dark mode</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                {theme === 'dark' ? 'Currently on' : 'Currently off'}
              </p>
            </div>
            <button type="button" onClick={() => {
              toggleTheme()
              setForm(f => ({ ...f, theme: theme === 'dark' ? 'light' : 'dark' }))
            }}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{ background: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-border)' }}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                style={{ left: theme === 'dark' ? '26px' : '2px' }} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Zen mode</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Hides streaks, badges, and level indicators
              </p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, zen_mode: !f.zen_mode }))}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{ background: form.zen_mode ? 'var(--color-accent)' : 'var(--color-border)' }}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                style={{ left: form.zen_mode ? '26px' : '2px' }} />
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
