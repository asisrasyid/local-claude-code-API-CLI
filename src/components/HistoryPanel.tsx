'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

interface SessionMeta {
  id: string
  title: string
  date: string
  mode: string
  messageCount: number
}

interface HistoryPanelProps {
  open: boolean
  onClose: () => void
}

export default function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const [sessions, setSessions] = useState<SessionMeta[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    if (open) {
      fetch('/api/history')
        .then(r => r.json())
        .then(setSessions)
        .catch(() => {})
    }
  }, [open])

  const openSession = async (id: string) => {
    setSelected(id)
    setLoadingContent(true)
    try {
      const res = await fetch(`/api/history/${id}`)
      const data = await res.json()
      setContent(data.content ?? '')
    } catch {
      setContent('Gagal memuat sesi.')
    } finally {
      setLoadingContent(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full z-50 flex shadow-2xl"
            style={{ width: selected ? 900 : 360 }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Session list */}
            <div
              className="h-full flex flex-col shrink-0 overflow-hidden"
              style={{
                width: 360,
                background: 'var(--bg)',
                borderLeft: '1px solid var(--border)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--primary-dark)' }}>
                  🕐 Riwayat Chat
                </span>
                <button
                  onClick={onClose}
                  className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    Belum ada riwayat sesi.
                  </p>
                ) : (
                  sessions.map(s => (
                    <motion.button
                      key={s.id}
                      onClick={() => openSession(s.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
                      style={{
                        background: selected === s.id ? 'var(--accent)' : 'var(--bg-card)',
                        border: `1px solid ${selected === s.id ? 'var(--primary)' : 'var(--border)'}`,
                        color: selected === s.id ? '#fff' : 'var(--text)',
                      }}
                    >
                      <p className="text-xs font-semibold truncate">{s.title}</p>
                      <p className="text-xs mt-0.5 opacity-70">{s.date}</p>
                      <div className="flex gap-2 mt-1">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{
                            background: selected === s.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)',
                            color: selected === s.id ? '#fff' : 'var(--text-muted)',
                          }}
                        >
                          {s.mode}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{
                            background: selected === s.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)',
                            color: selected === s.id ? '#fff' : 'var(--text-muted)',
                          }}
                        >
                          {s.messageCount} pesan
                        </span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Content viewer */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  className="flex-1 h-full flex flex-col overflow-hidden"
                  style={{
                    background: 'var(--bg-card)',
                    borderLeft: '1px solid var(--border)',
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 shrink-0"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {selected}
                    </span>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-xs hover:opacity-60"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      ✕ tutup
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loadingContent ? (
                      <div className="flex justify-center py-12">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.span
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{ background: 'var(--accent)' }}
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="prose prose-sm max-w-none"
                        style={{ color: 'var(--text)' }}
                      >
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
