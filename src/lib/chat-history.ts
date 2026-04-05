import fs from 'fs'
import path from 'path'

const LOG_DIR = path.resolve(process.cwd(), 'log-chat')
const HISTORY_DIR = path.join(LOG_DIR, 'chat-history')
const INDEX_FILE = path.join(LOG_DIR, 'index.md')

function ensureDirs() {
  fs.mkdirSync(HISTORY_DIR, { recursive: true })
}

export function generateSessionId(): string {
  const now = new Date()
  const d = now.toISOString().slice(0, 10).replace(/-/g, '')
  const t = now.toTimeString().slice(0, 8).replace(/:/g, '')
  return `${d}-${t}`
}

export interface SessionMeta {
  id: string
  title: string
  date: string
  mode: string
  messageCount: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function saveSession(
  id: string,
  title: string,
  mode: string,
  messages: ChatMessage[]
): void {
  ensureDirs()

  const date = new Date().toLocaleString('id-ID', {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  // Tulis session file
  const lines: string[] = [
    `# ${title}`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Sesi** | \`${id}\` |`,
    `| **Tanggal** | ${date} |`,
    `| **Mode** | ${mode} |`,
    `| **Pesan** | ${messages.length} |`,
    ``,
    `---`,
    ``,
  ]

  for (const msg of messages) {
    const label = msg.role === 'user' ? '### 👤 User' : '### 🤖 Claude'
    lines.push(label)
    lines.push('')
    lines.push(msg.content)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  const sessionPath = path.join(HISTORY_DIR, `${id}.md`)
  fs.writeFileSync(sessionPath, lines.join('\n'), 'utf-8')

  // Update index.md
  updateIndex(id, title, date, mode, messages.length)
}

function updateIndex(
  id: string,
  title: string,
  date: string,
  mode: string,
  count: number
) {
  const row = `| ${date} | \`${id}\` | ${title} | ${mode} | ${count} |\n`

  if (!fs.existsSync(INDEX_FILE)) {
    const header = [
      `# Chat History Index`,
      ``,
      `| Tanggal | Sesi | Judul | Mode | Pesan |`,
      `|---------|------|-------|------|-------|`,
      ``,
    ].join('\n')
    fs.writeFileSync(INDEX_FILE, header + row, 'utf-8')
    return
  }

  let content = fs.readFileSync(INDEX_FILE, 'utf-8')

  // Update baris jika session sudah ada
  const escapedId = id.replace(/[-]/g, '\\$&')
  const existing = new RegExp(`\\|[^|]*\\|\`${escapedId}\`[^\\n]*\\n`)
  if (existing.test(content)) {
    content = content.replace(existing, row)
  } else {
    // Sisipkan setelah header tabel (baris ke-4)
    const lines = content.split('\n')
    const headerEnd = lines.findIndex(l => l.startsWith('|---'))
    lines.splice(headerEnd + 1, 0, row.trimEnd())
    content = lines.join('\n')
  }

  fs.writeFileSync(INDEX_FILE, content, 'utf-8')
}

export function listSessions(): SessionMeta[] {
  ensureDirs()
  if (!fs.existsSync(HISTORY_DIR)) return []

  return fs.readdirSync(HISTORY_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
    .map(f => {
      const id = f.replace('.md', '')
      const content = fs.readFileSync(path.join(HISTORY_DIR, f), 'utf-8')
      const titleMatch = content.match(/^# (.+)$/m)
      const dateMatch = content.match(/\*\*Tanggal\*\* \| (.+) \|/)
      const modeMatch = content.match(/\*\*Mode\*\* \| (.+) \|/)
      const msgCount = (content.match(/### (👤|🤖)/g) ?? []).length

      return {
        id,
        title: titleMatch?.[1]?.trim() ?? id,
        date: dateMatch?.[1]?.trim() ?? '',
        mode: modeMatch?.[1]?.trim() ?? 'default',
        messageCount: msgCount,
      }
    })
}

export function getSessionContent(id: string): string | null {
  const filePath = path.join(HISTORY_DIR, `${id}.md`)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf-8')
}
