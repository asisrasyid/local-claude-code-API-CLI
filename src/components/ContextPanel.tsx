'use client'

import { useState } from 'react'
import { FileText, ChevronLeft, ChevronRight, RefreshCw, PlusCircle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ContextFileMeta } from '@/types'

interface ContextPanelProps {
  files: ContextFileMeta[]
  onRefresh: () => void
  chatSource: 'api' | 'cli'
  sessionId: string
  sessionTitle: string
  onNewSession: () => void
  onOpenHistory: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} mnt lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

function fmtChars(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

export default function ContextPanel({
  files, onRefresh, chatSource, sessionId, sessionTitle, onNewSession, onOpenHistory,
}: ContextPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.div
      animate={{ width: collapsed ? 40 : 260 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
      className="flex flex-col shrink-0 overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Collapsed strip */}
      <motion.div
        animate={{ opacity: collapsed ? 1 : 0, pointerEvents: collapsed ? 'auto' : 'none' }}
        transition={{ duration: 0.15 }}
        className="absolute flex flex-col items-center py-4 gap-4"
        style={{ width: 40 }}
      >
        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(false)} style={{ color: 'var(--text-muted)' }}>
          <ChevronRight size={16} />
        </motion.button>
        <FileText size={14} style={{ color: 'var(--border)' }} />
        <Clock size={14} style={{ color: 'var(--border)' }} />
      </motion.div>

      {/* Expanded content */}
      <motion.div
        animate={{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }}
        transition={{ duration: 0.18, delay: collapsed ? 0 : 0.08 }}
        className="flex flex-col h-full overflow-hidden"
        style={{ minWidth: 260 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--primary-dark)' }}>
            ✦ Local Claude
          </span>
          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(true)} style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft size={14} />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* Status API/CLI */}
          <div className="px-3 pt-3">
            <div className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: chatSource === 'cli' ? '#f59e0b' : '#10b981' }}
              />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  {chatSource === 'cli' ? 'Claude Code CLI' : 'Anthropic API'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {chatSource === 'cli' ? 'Fallback aktif' : 'Terhubung'}
                </p>
              </div>
            </div>
          </div>

          {/* Sesi aktif */}
          <div className="px-3 pt-2">
            <div className="rounded-xl px-3 py-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
                Sesi aktif
              </p>
              <p className="text-xs font-mono truncate" style={{ color: 'var(--text)' }}>
                {sessionId}
              </p>
              {sessionTitle && (
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {sessionTitle}
                </p>
              )}
            </div>
          </div>

          {/* Aksi sesi */}
          <div className="px-3 pt-2 space-y-1.5">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={onNewSession}
              className="w-full flex items-center gap-2 text-xs rounded-xl px-3 py-2 font-medium"
              style={{ background: 'var(--primary-dark)', color: 'var(--bg)', border: 'none' }}
            >
              <PlusCircle size={13} />
              Sesi Baru
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={onOpenHistory}
              className="w-full flex items-center gap-2 text-xs rounded-xl px-3 py-2 font-medium"
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <Clock size={13} />
              Riwayat Chat
            </motion.button>
          </div>

          {/* Divider */}
          <div className="mx-3 my-3" style={{ borderTop: '1px solid var(--border)' }} />

          {/* Context files */}
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                <FileText size={12} />
                Context Files
              </div>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                onClick={onRefresh} style={{ color: 'var(--text-muted)' }} title="Refresh">
                <RefreshCw size={11} />
              </motion.button>
            </div>

            <div className="space-y-1.5">
              {files.map((f) => (
                <div
                  key={f.filename}
                  className="rounded-xl px-3 py-2"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-mono font-medium truncate" style={{ color: 'var(--text)' }}>
                      {f.filename}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold ml-1 shrink-0"
                      style={f.loaded
                        ? { background: '#d1fae5', color: '#065f46' }
                        : { background: '#fee2e2', color: '#991b1b' }
                      }>
                      {f.loaded ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{fmtChars(f.charCount)} chars</span>
                    <span>·</span>
                    <span>{timeAgo(f.lastModified)}</span>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <p className="text-xs text-center py-3" style={{ color: 'var(--border)' }}>
                  Memuat context...
                </p>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}
