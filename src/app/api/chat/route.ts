import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { loadContextFiles, updateContextFile } from '@/lib/context-loader'
import { buildSystemPrompt, AgentMode } from '@/lib/system-prompt'
import { CLAUDE_TOOLS } from '@/lib/claude-tools'
import { sm } from '@/lib/sheetmaster'
import { streamFromCLI } from '@/lib/chat-cli'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function isCreditError(e: unknown): boolean {
  return e instanceof Error && e.message.includes('credit balance is too low')
}

export async function POST(req: NextRequest) {
  const { messages, mode } = await req.json() as {
    messages: Anthropic.MessageParam[]
    mode: AgentMode
  }

  const contextFiles = await loadContextFiles()
  const systemPrompt = buildSystemPrompt(contextFiles, mode)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        let currentMessages = [...messages]

        // Loop untuk handle tool use
        while (true) {
          let response: Awaited<ReturnType<typeof anthropic.messages.create>>

          try {
            response = await anthropic.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 8096,
              system: systemPrompt,
              tools: CLAUDE_TOOLS,
              messages: currentMessages,
              stream: true,
            })
          } catch (e) {
            if (isCreditError(e)) {
              // Langsung fallback ke CLI tanpa delay
              send({ type: 'mode', source: 'cli' })
              for await (const event of streamFromCLI(
                messages as { role: 'user' | 'assistant'; content: string }[],
                mode
              )) {
                send(event)
                if (event.type === 'done') break
              }
              controller.close()
              return
            }
            throw e
          }

          let fullText = ''
          type ToolUse = { type: 'tool_use'; id: string; name: string; input: Record<string, string> }
          const toolUses: ToolUse[] = []
          let stopReason = ''
          const pendingToolUses = new Map<number, { id: string; name: string; inputJson: string }>()

          for await (const event of response) {
            if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
              pendingToolUses.set(event.index, {
                id: event.content_block.id,
                name: event.content_block.name,
                inputJson: '',
              })
            }

            if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                fullText += event.delta.text
                send({ type: 'text', delta: event.delta.text })
              }
              if (event.delta.type === 'input_json_delta') {
                const pending = pendingToolUses.get(event.index)
                if (pending) pending.inputJson += event.delta.partial_json
              }
            }

            if (event.type === 'content_block_stop') {
              const pending = pendingToolUses.get(event.index)
              if (pending) {
                toolUses.push({
                  type: 'tool_use',
                  id: pending.id,
                  name: pending.name,
                  input: JSON.parse(pending.inputJson || '{}'),
                })
                pendingToolUses.delete(event.index)
              }
            }

            if (event.type === 'message_delta') {
              stopReason = event.delta.stop_reason || ''
            }
          }

          if (stopReason !== 'tool_use' || toolUses.length === 0) break

          const toolResults: Anthropic.ToolResultBlockParam[] = []
          for (const toolUse of toolUses) {
            send({ type: 'tool_call', name: toolUse.name })
            let result: unknown
            try {
              const input = toolUse.input
              if (toolUse.name === 'get_boards') {
                result = await sm.getBoards()
              } else if (toolUse.name === 'get_board_tasks') {
                result = await sm.getBoard(input.boardId)
              } else if (toolUse.name === 'create_task') {
                result = await sm.createTask(input.boardId, input.columnId, input.title, input.priority, input.description)
              } else if (toolUse.name === 'create_subtask') {
                result = await sm.createSubTask(input.taskId, input.title)
              } else if (toolUse.name === 'update_context_file') {
                await updateContextFile(input.filename, input.content)
                result = { success: true }
              } else if (toolUse.name === 'read_file') {
                const filePath = input.path.replace(/\//g, path.sep)
                result = fs.readFileSync(filePath, 'utf-8')
              } else if (toolUse.name === 'write_file') {
                const filePath = input.path.replace(/\//g, path.sep)
                fs.mkdirSync(path.dirname(filePath), { recursive: true })
                fs.writeFileSync(filePath, input.content, 'utf-8')
                result = { success: true, path: filePath }
              } else if (toolUse.name === 'list_directory') {
                const dirPath = input.path.replace(/\//g, path.sep)
                const entries = fs.readdirSync(dirPath, { withFileTypes: true })
                result = entries.map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' }))
              } else if (toolUse.name === 'create_directory') {
                const dirPath = input.path.replace(/\//g, path.sep)
                fs.mkdirSync(dirPath, { recursive: true })
                result = { success: true, path: dirPath }
              } else if (toolUse.name === 'run_bash') {
                const cwd = input.cwd ? input.cwd.replace(/\//g, path.sep) : process.cwd()
                const output = execSync(input.command, { cwd, encoding: 'utf-8', timeout: 60000 })
                result = { output: output.trim() }
              }
            } catch (e: unknown) {
              result = { error: e instanceof Error ? e.message : 'Unknown error' }
            }
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            })
          }

          currentMessages = [
            ...currentMessages,
            {
              role: 'assistant',
              content: [
                ...(fullText ? [{ type: 'text' as const, text: fullText }] : []),
                ...(toolUses as unknown as Anthropic.ToolUseBlock[]),
              ],
            },
            { role: 'user', content: toolResults },
          ]
        }

        send({ type: 'done' })
        controller.close()
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        send({ type: 'error', message: msg })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
