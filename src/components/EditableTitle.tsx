'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EditableTitleProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function EditableTitle({ value, onChange, placeholder = 'Ruang Diskusi' }: EditableTitleProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [inputWidth, setInputWidth] = useState(120)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    setDraft(value)
  }, [value])

  // Ukur lebar teks secara akurat lewat hidden span
  useEffect(() => {
    if (measureRef.current) {
      setInputWidth(Math.max(measureRef.current.offsetWidth + 16, 80))
    }
  }, [draft])

  const commit = () => {
    const trimmed = draft.trim()
    const final = trimmed || placeholder
    onChange(final)
    setDraft(final)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  const displayText = value || placeholder

  return (
    <div className="relative flex items-center">
      {/* Hidden span untuk mengukur lebar teks */}
      <span
        ref={measureRef}
        className="absolute invisible whitespace-pre text-sm font-bold tracking-wide pointer-events-none"
        style={{ fontFamily: 'inherit' }}
        aria-hidden
      >
        {draft || placeholder}
      </span>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative flex items-center"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              className="text-sm font-bold tracking-wide bg-transparent outline-none border-none leading-tight"
              style={{
                color: 'var(--primary-dark)',
                width: inputWidth,
                caretColor: 'var(--accent)',
                transition: 'width 0.12s ease',
              }}
            />
            {/* Animated underline */}
            <motion.div
              layoutId="title-underline"
              className="absolute bottom-0 left-0 right-0 h-px rounded-full"
              style={{ background: 'var(--accent)' }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </motion.div>
        ) : (
          <motion.button
            key="display"
            onClick={() => setEditing(true)}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative flex items-center gap-1.5 bg-transparent border-none outline-none cursor-text"
          >
            <motion.span
              className="text-sm font-bold tracking-wide leading-tight"
              style={{ color: 'var(--primary-dark)' }}
              animate={{ opacity: hovered ? 0.7 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {displayText}
            </motion.span>

            {/* Edit hint icon */}
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0, x: -4, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -4, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ✏
                </motion.span>
              )}
            </AnimatePresence>

            {/* Hover underline */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-px rounded-full"
              style={{ background: 'var(--text-muted)' }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: hovered ? 1 : 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
