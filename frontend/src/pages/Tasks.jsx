import { useEffect, useState } from 'react'
import { getTasks, getTags, completeTask, deleteTask, bulkComplete, bulkDelete, createTask } from '../api/tasks'
import TaskEditModal from '../components/TaskEditModal'

const TABS = ['active', 'completed', 'attention']

function formatMinutes(m) {
  if (!m) return null
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0 && min > 0) return `${h}h ${min}m`
  if (h > 0) return `${h}h`
  return `${min}m`
}

export default function Tasks() {
  const [tab, setTab] = useState('active')
  const [tasks, setTasks] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [sort, setSort] = useState('due_date')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [editModalTask, setEditModalTask] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '' })

  const load = async () => {
    setLoading(true)
    setSelected(new Set())
    const params = { tab, sort }
    if (filterPriority) params.priority = filterPriority
    if (filterTag) params.tag = filterTag
    const { data } = await getTasks(params)
    setTasks(data.results || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [tab, sort, filterPriority, filterTag])
  useEffect(() => { getTags().then(({ data }) => setTags(data.results || [])) }, [])

  const toggle = (id) => setSelected(s => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const handleComplete = async (id) => { await completeTask(id); load() }
  const handleBulkComplete = async () => { await bulkComplete([...selected]); load() }
  const handleBulkDelete = async () => { await bulkDelete([...selected]); load() }

  const handleAdd = async (e) => {
    e.preventDefault()
    await createTask({ ...newTask, due_date: newTask.due_date || undefined })
    setShowAdd(false)
    setNewTask({ title: '', priority: 'medium', due_date: '' })
    load()
  }

  const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#7D9B76' }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Tasks</h1>
        <button onClick={() => setShowAdd(v => !v)} className="btn-primary text-sm px-3 py-1.5">
          + Add task
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card space-y-3">
          <input className="input" placeholder="Task title" required
            value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} autoFocus />
          <div className="flex gap-2">
            <select className="input" value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input className="input" type="date" value={newTask.due_date}
              onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save</button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--color-surface)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              tab === t ? 'text-white shadow-sm' : ''
            }`}
            style={tab === t
              ? { background: 'var(--color-accent)' }
              : { color: 'var(--color-muted)' }
            }>
            {t === 'attention' ? 'Needs Attention' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select className="input text-xs py-1 w-auto"
          value={sort} onChange={e => setSort(e.target.value)}>
          <option value="due_date">Sort: Due date</option>
          <option value="priority">Sort: Priority</option>
          <option value="created">Sort: Created</option>
        </select>
        <select className="input text-xs py-1 w-auto"
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {tags.length > 0 && (
          <select className="input text-xs py-1 w-auto"
            value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="">All tags</option>
            {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="card flex items-center gap-3 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={handleBulkComplete} className="text-sm btn-primary py-1 px-3">Complete</button>
          <button onClick={handleBulkDelete}
            className="text-sm px-3 py-1 rounded-md transition-colors"
            style={{ color: 'var(--color-danger)' }}>
            Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm btn-ghost py-1 px-3 ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>
          {tab === 'active' ? 'No active tasks. Add one above!' :
           tab === 'completed' ? 'No completed tasks yet.' :
           'Nothing needs attention right now.'}
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id}
              className="card flex items-center gap-3 group"
              style={t.needs_attention ? { borderLeftColor: 'var(--color-warm)', borderLeftWidth: 3 } : {}}>
              {/* Select checkbox */}
              <input type="checkbox" className="w-4 h-4 rounded shrink-0"
                checked={selected.has(t.id)}
                onChange={() => toggle(t.id)} />
              {/* Complete button */}
              <button
                onClick={() => !t.is_complete && handleComplete(t.id)}
                className="w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors"
                style={{
                  borderColor: t.is_complete ? 'var(--color-accent)' : 'var(--color-border)',
                  background: t.is_complete ? 'var(--color-accent)' : 'transparent',
                }}
                disabled={t.is_complete}>
                {t.is_complete && <span className="text-white text-xs">✓</span>}
              </button>
              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm truncate cursor-pointer ${t.is_complete ? 'line-through' : ''}`}
                  style={{ color: t.is_complete ? 'var(--color-muted)' : 'var(--color-text)' }}
                  onClick={() => setEditModalTask(t)}
                >
                  {t.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {t.due_date && (
                    <span className="text-xs" style={{ color: t.is_overdue ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                      {t.is_overdue ? '⚠ ' : ''}{t.due_date}
                    </span>
                  )}
                  {/* Time chip */}
                  {t.is_complete && t.actual_minutes ? (
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      ⏱ {formatMinutes(t.actual_minutes)}{t.estimated_minutes ? ` / ${formatMinutes(t.estimated_minutes)}` : ''}
                    </span>
                  ) : t.estimated_minutes ? (
                    <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--color-muted)' }}>
                      ⏱ {formatMinutes(t.estimated_minutes)}
                    </span>
                  ) : null}
                  {t.tags?.map(tag => (
                    <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: tag.color + '22', color: tag.color }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
              {/* Priority badge */}
              <span className={`badge-${t.priority} shrink-0`}>{t.priority}</span>
              {/* Edit icon */}
              <button
                onClick={() => setEditModalTask(t)}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-xs px-2 py-1 rounded transition-opacity"
                style={{ color: 'var(--color-muted)' }}>
                ✎
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editModalTask && (
        <TaskEditModal
          task={editModalTask}
          onClose={() => setEditModalTask(null)}
          onSaved={() => { setEditModalTask(null); load() }}
        />
      )}
    </div>
  )
}
