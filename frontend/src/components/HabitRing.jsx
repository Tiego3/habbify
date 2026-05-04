import { logHabit } from '../api/habits'
import { useState } from 'react'

export default function HabitRing({ habit, zenMode, onToggle }) {
  const [completed, setCompleted] = useState(habit.is_completed_today)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    const next = !completed
    try {
      await logHabit(habit.id, {
        date: new Date().toISOString().split('T')[0],
        completed: next,
      })
      setCompleted(next)
      onToggle?.()
    } finally {
      setLoading(false)
    }
  }

  const r = 22
  const circ = 2 * Math.PI * r
  const rate = habit.completion_rate / 100
  const dash = rate * circ

  return (
    <button
      onClick={toggle}
      className="flex flex-col items-center gap-1 p-2 rounded-lg transition-opacity hover:opacity-80"
      style={{ minWidth: 64 }}
      aria-label={`${habit.name}: ${completed ? 'completed' : 'not done'}`}
    >
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4"
            stroke="var(--color-border)" />
          <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4"
            stroke={habit.color || 'var(--color-accent)'}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {completed
            ? <span className="text-lg">✓</span>
            : <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                {habit.completion_rate}%
              </span>
          }
        </div>
      </div>
      <span className="text-xs text-center leading-tight max-w-[64px] truncate"
        style={{ color: 'var(--color-text)' }}>
        {habit.name}
      </span>
      {!zenMode && habit.current_streak > 0 && (
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {habit.current_streak}🔥
        </span>
      )}
    </button>
  )
}
