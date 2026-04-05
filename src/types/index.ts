export type AgentMode = 'default' | 'pm'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: string[]
  timestamp: Date
}

export interface ContextFileMeta {
  filename: string
  charCount: number
  lastModified: string
  loaded: boolean
}
