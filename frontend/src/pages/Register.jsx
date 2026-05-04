import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuthStore } from '../store'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(form.username, form.email, form.password)
      setUser(data.user)
      navigate('/')
    } catch (err) {
      const d = err.response?.data
      const msg = d ? Object.values(d).flat().join(' ') : 'Registration failed'
      setError(msg)
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
          Build lasting habits, one day at a time.
        </p>
        <form onSubmit={submit} className="card space-y-4">
          <h2 className="font-semibold text-lg">Create account</h2>
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
            <label className="text-sm font-medium block mb-1">Email</label>
            <input className="input" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <input className="input" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-center text-sm" style={{ color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium"
              style={{ color: 'var(--color-accent)' }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
