import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getTasks } from '../api/tasks'
import { getHabits } from '../api/habits'
import api from '../api/client'
import AddModal from '../components/AddModal'
import HabitRing from '../components/HabitRing'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function today() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([])
  const [insight, setInsight] = useState(null)
  const [insightLoading, setInsightLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const zenMode = user?.profile?.zen_mode

  useEffect(() => {
    getTasks({ tab: 'active' }).then(({ data }) => setTasks(data.results || []))
    getHabits().then(({ data }) => setHabits(data.results || []))

    api.get('/ai/insight/')
      .then(({ data }) => setInsight(data.insight))
      .catch(() => setInsight('Keep building your habits one day at a time.'))
      .finally(() => setInsightLoading(false))
  }, [])

  const today_date = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.due_date === today_date).slice(0, 5)
  const attentionTasks = tasks.filter(t => t.needs_attention)
  const topStreaks = [...habits]
    .sort((a, b) => b.current_streak - a.current_streak)
    .slice(0, 3)

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold"
          style={{ color: 'var(--color-text)' }}>
          {greeting()}, {user?.profile?.display_name || user?.username} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>{today()}</p>
      </div>

      {/* Habit rings */}
      {habits.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide"
            style={{ color: 'var(--color-muted)' }}>Today's Habits</h2>
          <div className="flex flex-wrap gap-4">
            {habits.filter(h => h.is_scheduled_today).map(h => (
              <HabitRing key={h.id} habit={h} zenMode={zenMode} />
            ))}
          </div>
        </section>
      )}

      {/* Top streaks */}
      {!zenMode && topStreaks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide"
            style={{ color: 'var(--color-muted)' }}>Top Streaks</h2>
          <div className="flex gap-3 flex-wrap">
            {topStreaks.map(h => (
              <div key={h.id} className="card flex items-center gap-3 px-4 py-3">
                <div className="w-3 h-3 rounded-full" style={{ background: h.color }} />
                <span className="text-sm font-medium">{h.name}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                  {h.current_streak}d
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Needs attention */}
      {attentionTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide"
            style={{ color: 'var(--color-muted)' }}>Needs Attention</h2>
          <div className="space-y-2">
            {attentionTasks.slice(0, 4).map(t => (
              <div key={t.id} className="card border-l-4 flex items-center gap-3"
                style={{ borderLeftColor: 'var(--color-warm)' }}>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    {t.due_date ? `Due ${t.due_date}` : 'High priority'}
                  </p>
                </div>
                <span className={`badge-${t.priority}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Today's tasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-muted)' }}>Today's Tasks</h2>
          <Link to="/tasks" className="text-xs" style={{ color: 'var(--color-accent)' }}>
            View all
          </Link>
        </div>
        {todayTasks.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            No tasks due today. Nice!
          </p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map(t => (
              <div key={t.id} className="card flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 shrink-0"
                  style={{ borderColor: 'var(--color-border)' }} />
                <span className="text-sm flex-1">{t.title}</span>
                <span className={`badge-${t.priority}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Insight chip */}
      <section>
        <div className="card flex items-center gap-3 py-3">
          <span className="text-lg">✦</span>
          {insightLoading ? (
            <div className="h-4 rounded w-48 animate-pulse"
              style={{ background: 'var(--color-border)' }} />
          ) : (
            <p className="text-sm italic" style={{ color: 'var(--color-muted)' }}>
              {insight}
            </p>
          )}
        </div>
      </section>

      {/* Floating + button */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 rounded-full shadow-lg text-white text-2xl flex items-center justify-center z-30 transition-transform hover:scale-110"
        style={{ background: 'var(--color-accent)' }}
        aria-label="Add task or habit"
      >
        +
      </button>

      {addOpen && <AddModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
