'use client'

import { useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AgentMode } from '@/types'

interface InputBarProps {
  onSend: (msg: string) => void
  disabled: boolean
  mode: AgentMode
}

export default function InputBar({ onSend, disabled, mode }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled && textareaRef.current) textareaRef.current.focus()
  }, [disabled])

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 144) + 'px'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const val = textareaRef.current?.value.trim()
    if (!val || disabled) return
    onSend(val)
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <div className="shrink-0 px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <span
            className="absolute left-3 top-2.5 text-xs font-semibold px-2 py-0.5 rounded-full leading-none z-10"
            style={{ background: 'var(--accent)', color: 'var(--primary-dark)' }}
          >
            {mode === 'pm' ? 'PM Agent' : 'Default'}
          </span>
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={disabled}
            onInput={resize}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... (Enter kirim, Shift+Enter baris baru)"
            className="w-full rounded-2xl px-4 pt-9 pb-3 text-sm resize-none outline-none transition-all"
            style={{
              minHeight: '72px',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1.5px solid var(--border)',
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <motion.button
          onClick={handleSend}
          disabled={disabled}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.93 }}
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl mb-1 transition-colors"
          style={{ background: disabled ? 'var(--border)' : 'var(--accent)', color: 'var(--primary-dark)' }}
        >
          {disabled
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={16} />
          }
        </motion.button>
      </div>
    </div>
  )
}
