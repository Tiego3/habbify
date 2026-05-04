import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store'
import { getMe } from '../api/auth'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      const { data } = await getMe()
      setUser(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold mb-2 text-center"
          style={{ color: 'var(--color-text)' }}>
          Habbify
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--color-muted)' }}>
          Your habits, your way.
        </p>
        <form onSubmit={submit} className="card space-y-4">
          <h2 className="font-semibold text-lg">Sign in</h2>
          {error && (
            <p className="text-sm p-2 rounded-md bg-red-50 text-red-700">{error}</p>
          )}
          <div>
            <label className="text-sm font-medium block mb-1">Username</label>
            <input className="input" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <input className="input" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-sm" style={{ color: 'var(--color-muted)' }}>
            New here?{' '}
            <Link to="/register" className="font-medium"
              style={{ color: 'var(--color-accent)' }}>
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
