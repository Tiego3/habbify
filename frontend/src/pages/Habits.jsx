import { useEffect, useState } from 'react'
import { getHabits, logHabit, getHabitStats, createHabit, updateHabit, deleteHabit } from '../api/habits'
import { useAuth } from '../hooks/useAuth'

const VIEWS = ['today', 'stats']

function Heatmap({ data, color }) {
  const weeks = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  const intensityColor = (d) => {
    if (!d.scheduled) return 'var(--color-surface)'
    if (!d.completed) return 'var(--color-border)'
    return color || 'var(--color-accent)'
  }

  return (
    <div className="flex gap-0.5 overflow-x-auto">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.map((day, di) => (
            <div key={di}
              className="w-3 h-3 rounded-sm"
              style={{ background: intensityColor(day) }}
              title={`${day.date}: ${day.completed ? 'done' : day.scheduled ? 'missed' : 'not scheduled'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function HabitCard({ habit, onToggle, zenMode }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(habit.is_completed_today)
  const today = new Date().toISOString().split('T')[0]

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    const next = !done
    try {
      await logHabit(habit.id, { date: today, completed: next })
      setDone(next)
      onToggle?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex items-center gap-4">
      <button onClick={toggle}
        className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
        style={{
          borderColor: done ? habit.color || 'var(--color-accent)' : 'var(--color-border)',
          background: done ? habit.color || 'var(--color-accent)' : 'transparent',
        }}>
        {done && <span className="text-white text-lg">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{habit.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {habit.category} · {habit.frequency}
        </p>
      </div>
      {!zenMode && habit.current_streak > 0 && (
        <div className="text-right shrink-0">
          <p className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
            {habit.current_streak}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>day streak</p>
        </div>
      )}
      {done ? (
        <span className="text-xs px-2 py-1 rounded-full shrink-0 font-medium"
          style={{ background: 'var(--color-accent)' + '22', color: 'var(--color-accent)' }}>
          Done
        </span>
      ) : (
        <span className="text-xs px-2 py-1 rounded-full shrink-0"
          style={{ background: 'var(--color-border)', color: 'var(--color-muted)' }}>
          {habit.is_scheduled_today ? 'Today' : 'Not today'}
        </span>
      )}
    </div>
  )
}

function StatsPanel({ habit }) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    getHabitStats(habit.id).then(({ data }) => setStats(data))
  }, [habit.id])

  if (!stats) return <div className="h-20 animate-pulse rounded-lg" style={{ background: 'var(--color-surface)' }} />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Current streak', value: `${stats.current_streak}d` },
          { label: 'Longest streak', value: `${stats.longest_streak}d` },
          { label: 'Completion rate', value: `${stats.completion_rate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center py-3">
            <p className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="text-xs font-semibold mb-3 uppercase tracking-wide"
          style={{ color: 'var(--color-muted)' }}>Last 90 days</p>
        <Heatmap data={stats.heatmap_data.slice(-90)} color={habit.color} />
      </div>
    </div>
  )
}

export default function Habits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [view, setView] = useState('today')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', category: '', frequency: 'daily', color: '#7D9B76' })
  const zenMode = user?.profile?.zen_mode

  const load = async () => {
    setLoading(true)
    const { data } = await getHabits()
    setHabits(data.results || [])
    if (!selected && data.results?.length > 0) setSelected(data.results[0])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    await createHabit(newHabit)
    setShowAdd(false)
    setNewHabit({ name: '', category: '', frequency: 'daily', color: '#7D9B76' })
    load()
  }

  const handleArchive = async (id) => {
    await updateHabit(id, { is_archived: true })
    load()
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Habits</h1>
        <button onClick={() => setShowAdd(v => !v)} className="btn-primary text-sm px-3 py-1.5">
          + Add habit
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card space-y-3">
          <input className="input" placeholder="Habit name" required
            value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} autoFocus />
          <div className="flex gap-2">
            <input className="input" placeholder="Category (optional)"
              value={newHabit.category} onChange={e => setNewHabit({ ...newHabit, category: e.target.value })} />
            <select className="input" value={newHabit.frequency}
              onChange={e => setNewHabit({ ...newHabit, frequency: e.target.value })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
            <input type="color" className="w-10 h-10 rounded-md border p-0.5 cursor-pointer shrink-0"
              style={{ borderColor: 'var(--color-border)' }}
              value={newHabit.color}
              onChange={e => setNewHabit({ ...newHabit, color: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save</button>
          </div>
        </form>
      )}

      {/* View tabs */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--color-surface)' }}>
        {VIEWS.map(v => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors"
            style={view === v
              ? { background: 'var(--color-accent)', color: '#fff' }
              : { color: 'var(--color-muted)' }
            }>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>
          No habits yet. Add your first one!
        </p>
      ) : (
        <>
          {view === 'today' && (
            <div className="space-y-2">
              {habits.map(h => (
                <div key={h.id} className="group relative">
                  <HabitCard habit={h} onToggle={load} zenMode={zenMode} />
                  <button
                    onClick={() => handleArchive(h.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded transition-opacity"
                    style={{ color: 'var(--color-muted)' }}>
                    Archive
                  </button>
                </div>
              ))}
            </div>
          )}

          {view === 'stats' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap mb-2">
                {habits.map(h => (
                  <button key={h.id} onClick={() => setSelected(h)}
                    className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                    style={selected?.id === h.id
                      ? { background: h.color || 'var(--color-accent)', color: '#fff' }
                      : { background: 'var(--color-surface)', color: 'var(--color-muted)' }
                    }>
                    {h.name}
                  </button>
                ))}
              </div>
              {selected && <StatsPanel habit={selected} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
