'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AgentMode, Message, ContextFileMeta } from '@/types'
import ChatWindow from '@/components/ChatWindow'
import InputBar from '@/components/InputBar'
import ContextPanel from '@/components/ContextPanel'
import ModeToggle from '@/components/ModeToggle'
import ThemeControl from '@/components/ThemeControl'
import HistoryPanel from '@/components/HistoryPanel'
import EditableTitle from '@/components/EditableTitle'

function generateSessionId(): string {
  const now = new Date()
  const d = now.toISOString().slice(0, 10).replace(/-/g, '')
  const t = now.toTimeString().slice(0, 8).replace(/:/g, '')
  return `${d}-${t}`
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingIndex, setStreamingIndex] = useState<number | undefined>(undefined)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [mode, setMode] = useState<AgentMode>('default')
  const [contextFiles, setContextFiles] = useState<ContextFileMeta[]>([])
  const [chatSource, setChatSource] = useState<'api' | 'cli'>('api')
  const [historyOpen, setHistoryOpen] = useState(false)

  const sessionId = useRef<string>(generateSessionId())
  const sessionTitle = useRef<string>('')
  const [pageTitle, setPageTitle] = useState('Ruang Diskusi')

  const fetchContext = useCallback(async () => {
    try {
      const res = await fetch('/api/context')
      const data = await res.json()
      setContextFiles(data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchContext()
    const interval = setInterval(fetchContext, 30000)
    return () => clearInterval(interval)
  }, [fetchContext])

  // Auto-save session setelah tiap exchange selesai
  const saveSession = useCallback(async (msgs: Message[], currentMode: AgentMode) => {
    if (msgs.length < 2) return
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId.current,
          title: sessionTitle.current || 'Sesi baru',
          mode: currentMode,
          messages: msgs.map(m => ({ role: m.role, content: m.content })),
        }),
      })
    } catch { /* silent */ }
  }, [])

  const handleSend = async (text: string) => {
    // Set judul sesi dari pesan pertama user
    if (!sessionTitle.current) {
      sessionTitle.current = text.slice(0, 60) + (text.length > 60 ? '…' : '')
    }

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setIsLoading(true)
    setActiveTool(null)

    const apiMessages = nextMessages.map(m => ({ role: m.role, content: m.content }))
    const newAssistantIndex = nextMessages.length

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, mode }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      const toolCallsFound: string[] = []
      let assistantAdded = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'text') {
              assistantText += event.delta

              if (!assistantAdded) {
                assistantAdded = true
                setMessages(prev => [
                  ...prev,
                  { role: 'assistant', content: assistantText, toolCalls: [], timestamp: new Date() },
                ])
                setStreamingIndex(newAssistantIndex)
                setActiveTool(null)
              } else {
                const captured = assistantText
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: captured }
                  return updated
                })
              }

            } else if (event.type === 'tool_call') {
              toolCallsFound.push(event.name)
              setActiveTool(event.name)

            } else if (event.type === 'mode') {
              setChatSource((event as { type: 'mode'; source: 'api' | 'cli' }).source)

            } else if (event.type === 'error') {
              setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `⚠ ${event.message}`, timestamp: new Date() },
              ])
            }
          } catch { /* skip malformed */ }
        }
      }

      if (toolCallsFound.length > 0) {
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, toolCalls: toolCallsFound }
          }
          return updated
        })
      }

      // Auto-save setelah exchange selesai
      const finalMessages = [
        ...nextMessages,
        { role: 'assistant' as const, content: assistantText, timestamp: new Date() },
      ]
      await saveSession(finalMessages, mode)

    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠ ${e instanceof Error ? e.message : 'Unknown error'}`, timestamp: new Date() },
      ])
    } finally {
      setIsLoading(false)
      setStreamingIndex(undefined)
      setActiveTool(null)
    }
  }

  const handleNewSession = () => {
    sessionId.current = generateSessionId()
    sessionTitle.current = ''
    setMessages([])
    setChatSource('api')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <ContextPanel
        files={contextFiles}
        onRefresh={fetchContext}
        chatSource={chatSource}
        sessionId={sessionId.current}
        sessionTitle={sessionTitle.current}
        onNewSession={handleNewSession}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Navbar atas — hanya judul + mode toggle */}
        <div
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <EditableTitle value={pageTitle} onChange={setPageTitle} />
          <div className="flex items-center gap-2">
            <ThemeControl />
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          streamingIndex={streamingIndex}
          activeTool={activeTool}
        />

        <InputBar onSend={handleSend} disabled={isLoading} mode={mode} />
      </div>

      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}
