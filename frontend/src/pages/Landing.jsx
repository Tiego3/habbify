import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '✓',
    title: 'Tasks',
    desc: 'Capture and clear your to-do list without friction.',
  },
  {
    icon: '○',
    title: 'Habits',
    desc: 'Track consistency, not perfection.',
  },
  {
    icon: '✦',
    title: 'AI Coach',
    desc: 'Patterns and suggestions, never pressure.',
  },
]

const STEPS = [
  { n: '1', label: 'Add your tasks and habits' },
  { n: '2', label: 'Check in daily' },
  { n: '3', label: 'Let the AI surface what\'s working' },
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-accent)' }}>
              Habbify
            </p>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight">
            Build the life you<br />keep planning for.
          </h1>

          <p className="text-lg max-w-md mx-auto" style={{ color: 'var(--color-muted)' }}>
            One place for tasks, habits, and an AI coach that meets you where you are — not where you think you should be.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-primary px-7 py-3 text-base rounded-lg">
              Get started
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 text-base rounded-lg font-medium border transition-colors"
              style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {FEATURES.map(f => (
            <div key={f.title} className="text-center space-y-4">
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl"
                style={{ background: 'var(--color-surface)', color: 'var(--color-accent)' }}
              >
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p style={{ color: 'var(--color-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <hr style={{ borderColor: 'var(--color-border)' }} />
      </div>

      {/* How it works */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center mb-14">
          How it works
        </h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-4">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex md:flex-col items-start md:items-center gap-5 md:gap-4 md:text-center flex-1">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ background: 'var(--color-accent)' }}
              >
                {s.n}
              </div>
              <p className="text-base font-medium" style={{ color: 'var(--color-text)' }}>{s.label}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block flex-1 h-px mt-5 self-start"
                  style={{ background: 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-display text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
              Habbify
            </span>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Build better habits, one day at a time.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/login" style={{ color: 'var(--color-muted)' }}
              className="hover:underline">
              Sign in
            </Link>
            <Link to="/register" style={{ color: 'var(--color-accent)' }}
              className="hover:underline">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
