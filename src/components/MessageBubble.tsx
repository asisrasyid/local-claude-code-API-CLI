'use client'

import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: string[]
  isStreaming?: boolean
}

export default function MessageBubble({ role, content, toolCalls, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, x: isUser ? 40 : -40, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <div className={`max-w-[75%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {toolCalls && toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {toolCalls.map((tool, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.06 }}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--bg-card)', color: 'var(--primary)', border: '1px solid var(--border)' }}
              >
                ⚡ {tool}
              </motion.span>
            ))}
          </div>
        )}

        <motion.div
          layout
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
          }`}
          style={
            isUser
              ? { background: 'var(--primary)', color: '#fff' }
              : { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }
          }
        >
          <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {isStreaming && <span className="typing-cursor" />}
        </motion.div>
      </div>
    </motion.div>
  )
}
