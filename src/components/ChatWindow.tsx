'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/types'
import MessageBubble from './MessageBubble'

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  streamingIndex?: number
  activeTool?: string | null
}

const TOOL_LABELS: Record<string, string> = {
  get_boards: 'Membaca boards SheetMaster',
  get_board_tasks: 'Mengambil task dari board',
  create_task: 'Membuat task baru',
  create_subtask: 'Menambahkan subtask',
  update_context_file: 'Mengupdate file context',
  read_file: 'Membaca file',
  write_file: 'Menulis file',
  list_directory: 'Membuka direktori',
  create_directory: 'Membuat direktori',
  run_bash: 'Menjalankan perintah',
}

export default function ChatWindow({ messages, isLoading, streamingIndex, activeTool }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, activeTool])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[300px]"
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">👋</div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Halo Azis, context sudah ter-load.
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Mau diskusi apa hari ini?
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <MessageBubble
                key={i}
                role={msg.role}
                content={msg.content}
                toolCalls={msg.toolCalls}
                isStreaming={streamingIndex === i}
              />
            ))
          )}
        </AnimatePresence>

        {/* Tool in progress indicator */}
        <AnimatePresence>
          {isLoading && activeTool && (
            <motion.div
              key="tool-progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex justify-start mb-3"
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block' }}
                >
                  ⚙
                </motion.span>
                {TOOL_LABELS[activeTool] ?? activeTool}…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing dots — tampil saat loading tapi belum ada response */}
        <AnimatePresence>
          {isLoading && streamingIndex === undefined && !activeTool && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex justify-start mb-4"
            >
              <div
                className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
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
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
