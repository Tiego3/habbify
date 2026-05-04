import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getInsights } from '../api/habits'

const TIMEFRAMES = ['week', 'month', 'year']

export default function Insights() {
  const [timeframe, setTimeframe] = useState('week')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getInsights(timeframe)
      .then(({ data: d }) => setData(d))
      .finally(() => setLoading(false))
  }, [timeframe])

  const chartColor = '#7D9B76'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Insights</h1>
        {/* Segmented control */}
        <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--color-surface)' }}>
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTimeframe(t)}
              className="px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors"
              style={timeframe === t
                ? { background: 'var(--color-accent)', color: '#fff' }
                : { color: 'var(--color-muted)' }
              }>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-lg animate-pulse"
              style={{ background: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Habit consistency', value: `${data.habit_consistency}%` },
              { label: 'Task completion', value: `${data.task_completion_rate}%` },
              { label: 'Top streak', value: `${data.top_streak}d` },
              { label: 'Best day', value: data.most_productive_day?.slice(0, 3) || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center py-4">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Pattern cards */}
          {data.patterns?.length > 0 && (
            <div className="space-y-2">
              {data.patterns.map((p, i) => (
                <div key={i} className="card flex items-start gap-3 py-3">
                  <span style={{ color: 'var(--color-accent)' }}>✦</span>
                  <p className="text-sm">{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* Line chart: daily task completions */}
          <div className="card">
            <p className="text-sm font-semibold mb-4">Task completions over time</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.line_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--color-muted)', fontSize: 11 }}
                />
                <Line type="monotone" dataKey="count" stroke={chartColor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart: habits by day of week */}
          <div className="card">
            <p className="text-sm font-semibold mb-4">Habit completions by day</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.bar_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  tickFormatter={d => d.slice(0, 3)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--color-muted)', fontSize: 11 }}
                />
                <Bar dataKey="count" fill={chartColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Coming soon placeholders */}
          <div className="grid grid-cols-2 gap-3">
            {['Habit success probability', 'Burnout risk indicator'].map(label => (
              <div key={label} className="card py-6 text-center opacity-50 relative overflow-hidden">
                <p className="text-sm font-medium">{label}</p>
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-border)', color: 'var(--color-muted)' }}>
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
