'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AgentMode } from '@/types'

interface ModeToggleProps {
  mode: AgentMode
  onChange: (mode: AgentMode) => void
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const [toast, setToast] = useState(false)

  const handleSwitch = (next: AgentMode) => {
    onChange(next)
    if (next === 'pm') {
      setToast(true)
      setTimeout(() => setToast(false), 3000)
    }
  }

  return (
    <div className="relative flex items-center gap-1 rounded-full p-1"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {(['default', 'pm'] as AgentMode[]).map(m => {
        const active = mode === m
        return (
          <motion.button
            key={m}
            onClick={() => handleSwitch(m)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-xs px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1"
            style={{ color: active ? 'var(--primary-dark)' : 'var(--text-muted)' }}
          >
            {active && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: m === 'pm' ? '#f97316' : 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              {m === 'pm' && active && <AlertTriangle size={10} />}
              {m === 'pm' ? 'PM Agent' : 'Default'}
            </span>
          </motion.button>
        )
      })}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-10 right-0 text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-lg z-50 font-medium"
            style={{ background: '#f97316', color: '#fff', border: '1px solid #ea580c' }}
          >
            🔥 PM Agent aktif. Siap untuk review jujur.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
