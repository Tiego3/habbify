import { useEffect, useState, useCallback } from 'react'
import { getCalendarData } from '../api/calendar'
import { logHabit } from '../api/habits'
import { createTask } from '../api/tasks'
import TaskEditModal from '../components/TaskEditModal'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatMinutes(m) {
  if (!m) return null
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0 && min > 0) return `${h}h ${min}m`
  if (h > 0) return `${h}h`
  return `${min}m`
}

function MonthGrid({ year, month, selectedDate, tasksMap, habitsMap, onSelect }) {
  const firstDayOfMonth = new Date(year, month - 1, 1)
  // ISO week starts Monday; getDay() returns 0=Sun..6=Sat, convert to 0=Mon..6=Sun
  let startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="card">
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold py-1"
            style={{ color: 'var(--color-muted)' }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className="min-h-[56px]" />
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const hasTasks = (tasksMap[dateStr]?.length || 0) > 0
          const hasHabits = (habitsMap[dateStr]?.length || 0) > 0

          return (
            <button
              key={day}
              onClick={() => onSelect(dateStr)}
              className="min-h-[56px] p-1 flex flex-col items-center gap-1 rounded-md transition-colors hover:bg-[var(--color-border)]"
              style={isSelected ? { outline: `2px solid var(--color-accent)`, outlineOffset: '-2px' } : {}}
            >
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium"
                style={isToday
                  ? { background: 'var(--color-accent)', color: '#fff' }
                  : { color: 'var(--color-text)' }}
              >
                {day}
              </span>
              <div className="flex gap-0.5 h-2 items-center">
                {hasTasks && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--color-warm)' }} />
                )}
                {hasHabits && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--color-accent)' }} />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DayDetail({ selectedDate, tasksMap, habitsMap, onHabitToggle, onTaskClick, onTaskAdded }) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  const date = new Date(selectedDate + 'T00:00:00')
  const label = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const tasks = tasksMap[selectedDate] || []
  const habits = habitsMap[selectedDate] || []
  const isEmpty = tasks.length === 0 && habits.length === 0

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAddingTask(true)
    await createTask({ title: newTitle.trim(), priority: 'medium', due_date: selectedDate })
    setNewTitle('')
    setShowAddTask(false)
    setAddingTask(false)
    onTaskAdded?.()
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
        {label}
      </h2>

      {isEmpty && !showAddTask ? (
        <p className="text-sm py-2" style={{ color: 'var(--color-muted)' }}>
          Nothing scheduled — enjoy the breathing room.
        </p>
      ) : (
        <>
          {tasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--color-muted)' }}>
                Tasks due
              </p>
              <div className="space-y-2">
                {tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="card w-full flex items-start gap-3 py-2.5 text-left hover:border-[var(--color-accent)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{
                          color: 'var(--color-text)',
                          textDecoration: task.is_complete ? 'line-through' : 'none',
                          opacity: task.is_complete ? 0.6 : 1,
                        }}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge-${task.priority}`}>{task.priority}</span>
                        {task.estimated_minutes && (
                          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            ⏱ {formatMinutes(task.estimated_minutes)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {habits.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--color-muted)' }}>
                Habits
              </p>
              <div className="space-y-2">
                {habits.map(habit => (
                  <div key={habit.id} className="card flex items-center gap-3 py-2.5">
                    <button
                      onClick={() => onHabitToggle(habit, selectedDate)}
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        borderColor: habit.completed ? (habit.color || 'var(--color-accent)') : 'var(--color-border)',
                        background: habit.completed ? (habit.color || 'var(--color-accent)') : 'transparent',
                      }}
                    >
                      {habit.completed && <span className="text-white text-xs">✓</span>}
                    </button>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {habit.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showAddTask ? (
        <form onSubmit={handleAddTask} className="space-y-2">
          <input
            className="input text-sm"
            placeholder="Task title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAddTask(false)} className="btn-ghost flex-1 text-sm py-1.5">
              Cancel
            </button>
            <button type="submit" disabled={addingTask} className="btn-primary flex-1 text-sm py-1.5">
              {addingTask ? '…' : 'Add task'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddTask(true)}
          className="w-full text-sm py-2 rounded-md border-dashed border text-left px-3 transition-colors hover:bg-[var(--color-surface)]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          + Add task for this date
        </button>
      )}
    </div>
  )
}

export default function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editTask, setEditTask] = useState(null)

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: d } = await getCalendarData(monthStr)
      setData(d)
    } catch {
      setError('Failed to load calendar data.')
    } finally {
      setLoading(false)
    }
  }, [monthStr])

  useEffect(() => { load() }, [load])

  const tasksMap = {}
  const habitsMap = {}
  if (data) {
    for (const entry of data.tasks) tasksMap[entry.date] = entry.items
    for (const entry of data.habits) habitsMap[entry.date] = entry.items
  }

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const handleHabitToggle = async (habit, date) => {
    await logHabit(habit.id, { date, completed: !habit.completed })
    load()
  }

  const handleTaskClick = (taskSummary) => {
    // Fetch full task data from the tasksMap (it already has enough fields for the modal)
    // We need tag_ids etc., but since we don't have them in the calendar summary,
    // pass what we have; the modal will handle missing fields with defaults.
    setEditTask({
      id: taskSummary.id,
      title: taskSummary.title,
      description: '',
      priority: taskSummary.priority,
      due_date: selectedDate,
      tags: [],
      estimated_minutes: taskSummary.estimated_minutes,
      actual_minutes: null,
      is_complete: taskSummary.is_complete,
    })
  }

  if (error) {
    return (
      <div className="max-w-5xl space-y-4">
        <h1 className="font-display text-2xl font-bold">Calendar</h1>
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="font-display text-2xl font-bold">Calendar</h1>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="btn-ghost px-3 py-1 text-sm">← Prev</button>
        <h2 className="font-display text-xl font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button onClick={nextMonth} className="btn-ghost px-3 py-1 text-sm">Next →</button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-72 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />
          <div className="h-40 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
          <MonthGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            tasksMap={tasksMap}
            habitsMap={habitsMap}
            onSelect={setSelectedDate}
          />
          <DayDetail
            selectedDate={selectedDate}
            tasksMap={tasksMap}
            habitsMap={habitsMap}
            onHabitToggle={handleHabitToggle}
            onTaskClick={handleTaskClick}
            onTaskAdded={load}
          />
        </div>
      )}

      {editTask && (
        <TaskEditModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={() => { setEditTask(null); load() }}
        />
      )}
    </div>
  )
}
