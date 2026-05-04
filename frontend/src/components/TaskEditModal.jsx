import { useState, useEffect, useRef } from 'react'
import { updateTask, deleteTask, getTags, createTag } from '../api/tasks'

function formatMinutes(m) {
  if (m == null) return ''
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0 && min > 0) return `${h}h ${min}m`
  if (h > 0) return `${h}h`
  return `${min}m`
}

function TimeInput({ label, minutes, onChange }) {
  const h = minutes != null ? Math.floor(minutes / 60) : ''
  const m = minutes != null ? minutes % 60 : ''

  const update = (newH, newM) => {
    if (newH === '' && newM === '') { onChange(null); return }
    onChange((parseInt(newH) || 0) * 60 + (parseInt(newM) || 0))
  }

  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-muted)' }}>
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" min="0" max="99"
          className="input w-14 text-center px-2"
          value={h}
          onChange={e => update(e.target.value, m)}
          placeholder="0"
        />
        <span className="text-sm shrink-0" style={{ color: 'var(--color-muted)' }}>h</span>
        <input
          type="number" min="0" max="59"
          className="input w-14 text-center px-2"
          value={m}
          onChange={e => update(h, e.target.value)}
          placeholder="0"
        />
        <span className="text-sm shrink-0" style={{ color: 'var(--color-muted)' }}>m</span>
      </div>
    </div>
  )
}

export default function TaskEditModal({ task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.due_date || '',
    tag_ids: task.tags?.map(t => t.id) || [],
    estimated_minutes: task.estimated_minutes ?? null,
    actual_minutes: task.actual_minutes ?? null,
  })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [showTagDrop, setShowTagDrop] = useState(false)
  const tagRef = useRef(null)
  const backdropRef = useRef(null)

  useEffect(() => {
    getTags().then(({ data }) => setAllTags(data.results || []))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (tagRef.current && !tagRef.current.contains(e.target)) {
        setShowTagDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateTask(task.id, {
      title: form.title,
      description: form.description,
      priority: form.priority,
      due_date: form.due_date || null,
      tag_ids: form.tag_ids,
      estimated_minutes: form.estimated_minutes,
      actual_minutes: form.actual_minutes,
    })
    setSaving(false)
    setDirty(false)
    onSaved?.()
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    onSaved?.()
    onClose()
  }

  const handleClose = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) handleClose()
  }

  const toggleTag = (id) => {
    set('tag_ids', form.tag_ids.includes(id)
      ? form.tag_ids.filter(i => i !== id)
      : [...form.tag_ids, id]
    )
  }

  const handleCreateTag = async () => {
    if (!tagSearch.trim()) return
    const { data } = await createTag({ name: tagSearch.trim(), color: '#7D9B76' })
    setAllTags(t => [...t, data])
    set('tag_ids', [...form.tag_ids, data.id])
    setTagSearch('')
    setShowTagDrop(false)
  }

  const filteredTags = allTags.filter(t =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  )
  const canCreateTag = tagSearch.trim() &&
    !filteredTags.find(t => t.name.toLowerCase() === tagSearch.trim().toLowerCase())

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-lg rounded-xl border space-y-4 p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Edit task</h2>
          <button onClick={handleClose} className="text-xl leading-none w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-muted)' }}>✕</button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Title</label>
          <input className="input" value={form.title}
            onChange={e => set('title', e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Description</label>
          <textarea
            className="input resize-none"
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* Priority segmented control */}
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Priority</label>
          <div className="flex rounded-md border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {['low', 'medium', 'high'].map(p => (
              <button
                key={p}
                onClick={() => set('priority', p)}
                className="flex-1 py-2 text-sm font-medium capitalize transition-colors"
                style={form.priority === p
                  ? { background: 'var(--color-accent)', color: '#fff' }
                  : { color: 'var(--color-muted)' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Due date</label>
          <input className="input" type="date"
            value={form.due_date}
            onChange={e => set('due_date', e.target.value)} />
        </div>

        {/* Tags */}
        <div ref={tagRef}>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Tags</label>
          {form.tag_ids.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tag_ids.map(id => {
                const tag = allTags.find(t => t.id === id)
                return tag ? (
                  <span key={id} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: tag.color + '22', color: tag.color }}>
                    {tag.name}
                    <button onClick={() => toggleTag(id)} className="leading-none opacity-70 hover:opacity-100">✕</button>
                  </span>
                ) : null
              })}
            </div>
          )}
          <div className="relative">
            <input
              className="input text-sm"
              placeholder="Search or create a tag..."
              value={tagSearch}
              onChange={e => setTagSearch(e.target.value)}
              onFocus={() => setShowTagDrop(true)}
            />
            {showTagDrop && (filteredTags.length > 0 || canCreateTag) && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border max-h-40 overflow-y-auto"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                {filteredTags.map(t => (
                  <button key={t.id}
                    onClick={() => { toggleTag(t.id); setTagSearch(''); setShowTagDrop(false) }}
                    className="w-full text-left text-sm px-3 py-2 transition-colors hover:bg-[var(--color-surface)]"
                    style={{ color: form.tag_ids.includes(t.id) ? 'var(--color-accent)' : 'var(--color-text)' }}>
                    {form.tag_ids.includes(t.id) ? '✓ ' : ''}{t.name}
                  </button>
                ))}
                {canCreateTag && (
                  <button onClick={handleCreateTag}
                    className="w-full text-left text-sm px-3 py-2 transition-colors hover:bg-[var(--color-surface)]"
                    style={{ color: 'var(--color-accent)' }}>
                    + Create "{tagSearch.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Time fields */}
        <div className="grid grid-cols-2 gap-4">
          <TimeInput
            label="Estimated time"
            minutes={form.estimated_minutes}
            onChange={v => set('estimated_minutes', v)}
          />
          <TimeInput
            label="Actual time spent"
            minutes={form.actual_minutes}
            onChange={v => set('actual_minutes', v)}
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: 'var(--color-border)' }}>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>Delete task?</span>
              <button onClick={handleDelete}
                className="text-sm px-3 py-1 rounded-md font-medium"
                style={{ background: 'var(--color-danger)', color: '#fff' }}>
                Delete
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-sm py-1 px-3">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="text-sm px-2 py-1 rounded-md transition-colors hover:bg-[var(--color-surface)]"
              style={{ color: 'var(--color-danger)' }}>
              Delete task
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
