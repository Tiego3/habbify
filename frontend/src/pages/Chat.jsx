import { useState, useRef, useEffect } from 'react'

const SUGGESTED = [
  'How are my habits looking this week?',
  'What should I focus on today?',
  'Help me build a morning routine.',
  "I've been struggling — what should I adjust?",
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const content = text || input.trim()
    if (!content || streaming) return
    setInput('')
    setError('')

    const userMsg = { role: 'user', content }
    const history = [...messages, userMsg]
    setMessages([...history, { role: 'assistant', content: '' }])
    setStreaming(true)

    const token = localStorage.getItem('access_token')
    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('/api/ai/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: history,
          include_context: true,
          stream: true,
        }),
        signal: ctrl.signal,
      })

      if (!res.ok) throw new Error(`Error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (raw === '[DONE]') break
          try {
            const { text } = JSON.parse(raw)
            setMessages(prev => {
              const copy = [...prev]
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: copy[copy.length - 1].content + text,
              }
              return copy
            })
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError('Failed to get a response. Please try again.')
        setMessages(prev => prev.slice(0, -1))
      }
    } finally {
      setStreaming(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)] md:h-[calc(100dvh-4rem)] max-w-2xl">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold">AI Coach</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Your personal habit and productivity coach
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Ask me anything about your habits and tasks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-sm card py-3 hover:opacity-80 transition-opacity">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={m.role === 'user'
                ? { background: 'var(--color-warm)', color: '#fff',
                    borderBottomRightRadius: 4 }
                : { background: 'var(--color-surface)', color: 'var(--color-text)',
                    borderBottomLeftRadius: 4, border: '1px solid var(--color-border)' }
              }>
              {m.content || (m.role === 'assistant' && streaming && (
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map(j => (
                    <span key={j} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--color-muted)', animationDelay: `${j * 0.15}s` }} />
                  ))}
                </span>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-2 items-end">
          <textarea
            className="input flex-1 resize-none"
            rows={1}
            placeholder="Ask your coach…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{ minHeight: 44, maxHeight: 120 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || streaming}
            className="btn-primary px-4 py-2 shrink-0 disabled:opacity-50"
          >
            {streaming ? '…' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}
