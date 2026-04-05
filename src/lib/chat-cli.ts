import { spawn } from 'child_process'
import path from 'path'
import { AgentMode } from './system-prompt'

const BASH_PATH = process.env.CLAUDE_BASH_PATH ?? 'C:\\Users\\m.aziz\\AppData\\Local\\Programs\\Git\\usr\\bin\\bash.exe'

const CONTEXT_DIR = path.resolve(
  process.cwd(),
  process.env.CONTEXT_DIR || '../../updagrade-github/context-task/ai'
)

// Parent dir yang mencakup context-task/ai/ dan task-api.md
const ALLOWED_DIR = path.resolve(CONTEXT_DIR, '../../..')

// Project root (lokasi task-api.md chatbot)
const PROJECT_ROOT = process.cwd()

// Relative paths dari PROJECT_ROOT — hindari spasi di absolute path yang di-mangle shell
const REL_CONTEXT_DIR = path.relative(PROJECT_ROOT, CONTEXT_DIR).replace(/\\/g, '/')

const CONTEXT_FILE_REFS = [
  `${REL_CONTEXT_DIR}/rule_guide.md`,
  `${REL_CONTEXT_DIR}/snap.md`,
  `${REL_CONTEXT_DIR}/log.md`,
  `${REL_CONTEXT_DIR}/decisions.md`,
  'task-api.md',
]

interface CLIMessage {
  role: 'user' | 'assistant'
  content: string
}

function formatHistory(messages: CLIMessage[]): string {
  if (messages.length <= 1) return messages[0]?.content ?? ''

  const history = messages.slice(0, -1).map(m =>
    `[${m.role === 'user' ? 'User' : 'Assistant'}]: ${m.content}`
  ).join('\n\n')

  const last = messages[messages.length - 1]
  return `=== Riwayat percakapan sebelumnya ===\n${history}\n\n=== Pesan terbaru ===\n${last.content}`
}

function buildModeInstruction(mode: AgentMode): string {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  if (mode === 'pm') {
    return `Hari ini: ${today}

KAMU SEKARANG AKTIF SEBAGAI PM AGENT.
Bertindak sebagai project manager yang jujur, tegas, dan berbasis data.
Tidak segan komplain jika ada yang stuck atau tidak progress.
Selalu sertakan data (task count, nama task, durasi stuck) dalam feedback.
Akhiri setiap review dengan Top 3 Prioritas yang harus dikerjakan sekarang.`
  }

  return `Hari ini: ${today}

Kamu adalah AI assistant dan partner diskusi Muhammad Azis.
Bantu brainstorm, eksekusi task, coding, dan review project.
Jawab dalam Bahasa Indonesia kecuali istilah teknis.
Jika diminta PM review, switch ke mode PM yang tegas dan berbasis data.`
}

/**
 * Stream response dari Claude Code CLI.
 * Context files diarahkan langsung via @path — tidak di-embed ke prompt.
 */
export async function* streamFromCLI(
  messages: CLIMessage[],
  mode: AgentMode
): AsyncGenerator<{ type: 'text'; delta: string } | { type: 'done' } | { type: 'error'; message: string }> {
  const userMessage = formatHistory(messages)

  // Arahkan Claude ke file langsung — pakai relative path agar tidak ada spasi
  const fileRefs = CONTEXT_FILE_REFS.map(f => `@${f}`).join('\n')

  const fullPrompt = `${fileRefs}\n\n${userMessage}`

  const proc = spawn('claude', [
    '-p',
    '--dangerously-skip-permissions',  // full access — master command interface
    '--system-prompt', buildModeInstruction(mode),
    '--output-format', 'text',
    '--no-session-persistence',
  ], {
    env: {
      ...process.env,
      ANTHROPIC_API_KEY: '',        // force CLI pakai subscription auth, bukan API key depleted
      CLAUDE_CODE_GIT_BASH_PATH: BASH_PATH,
    },
    stdio: ['pipe', 'pipe', 'pipe'], // stdin piped — prompt ditulis via proc.stdin
    windowsHide: true,
    shell: true,
  })

  // Tulis prompt ke stdin untuk hindari shell mangling pada Windows
  proc.stdin!.write(fullPrompt, 'utf8')
  proc.stdin!.end()

  let fullText = ''
  let errorOutput = ''

  for await (const chunk of proc.stdout) {
    fullText += chunk.toString()
  }

  for await (const chunk of proc.stderr) {
    errorOutput += chunk.toString()
  }

  await new Promise<void>(resolve => proc.on('close', resolve))

  const text = fullText.trim()
  if (text) {
    yield { type: 'text', delta: text }
  } else if (errorOutput && !errorOutput.includes('rate_limit')) {
    yield { type: 'error', message: errorOutput.slice(0, 300) }
  }

  yield { type: 'done' }
}
