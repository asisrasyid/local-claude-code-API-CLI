'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const options = [
  { value: 'light',  label: 'Light',  Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark',   label: 'Dark',   Icon: Moon },
] as const

export default function ThemeControl() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex items-center gap-0.5 rounded-full p-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {options.map(({ value, Icon }) => {
        const active = theme === value
        return (
          <motion.button
            key={value}
            onClick={() => setTheme(value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="relative w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            title={value}
          >
            {active && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}
            <AnimatePresence mode="wait">
              <motion.span
                key={value + active}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <Icon size={13} style={{ color: active ? 'var(--primary-dark)' : 'var(--text-muted)' }} />
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}
