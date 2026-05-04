import { useState } from 'react'
import { createTask } from '../api/tasks'
import { createHabit } from '../api/habits'

export default function AddModal({ onClose, onCreated }) {
  const [mode, setMode] = useState('task')
  const [form, setForm] = useState({ title: '', name: '', priority: 'medium', frequency: 'daily', due_date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'task') {
        await createTask({ title: form.title, priority: form.priority, due_date: form.due_date || undefined })
      } else {
        await createHabit({ name: form.name, frequency: form.frequency })
      }
      onCreated?.()
      onClose()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-md space-y-4">
        <div className="flex gap-2">
          {['task', 'habit'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                mode === m ? 'text-white' : ''
              }`}
              style={mode === m
                ? { background: 'var(--color-accent)' }
                : { background: 'var(--color-border)', color: 'var(--color-muted)' }
              }>
              Add {m}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          {mode === 'task' ? (
            <>
              <input className="input" placeholder="Task title" required
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <select className="input" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
              <input className="input" type="date" value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </>
          ) : (
            <>
              <input className="input" placeholder="Habit name" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <select className="input" value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom days</option>
              </select>
            </>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
