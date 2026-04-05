import fs from 'fs'
import path from 'path'

const CONTEXT_DIR = process.env.CONTEXT_DIR || '../../updagrade-github/context-task/ai'

export interface ContextFile {
  filename: string
  content: string
  lastModified: Date
}

export async function loadContextFiles(): Promise<ContextFile[]> {
  const contextFiles = ['rule_guide.md', 'snap.md', 'log.md', 'decisions.md']
  const results: ContextFile[] = []

  // Context files dari CONTEXT_DIR
  for (const file of contextFiles) {
    const filePath = path.resolve(process.cwd(), CONTEXT_DIR, file)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const stats = fs.statSync(filePath)
      results.push({ filename: file, content, lastModified: stats.mtime })
    } catch {
      results.push({ filename: file, content: '[File not found]', lastModified: new Date() })
    }
  }

  // task-api.md — SheetMaster API doc, selalu diload dari project root
  const taskApiPath = path.resolve(process.cwd(), 'task-api.md')
  try {
    const content = fs.readFileSync(taskApiPath, 'utf-8')
    const stats = fs.statSync(taskApiPath)
    results.push({ filename: 'task-api.md', content, lastModified: stats.mtime })
  } catch {
    // tidak ada task-api.md di project root, skip
  }

  return results
}

export async function updateContextFile(filename: string, content: string): Promise<void> {
  const filePath = path.resolve(process.cwd(), CONTEXT_DIR, filename)
  fs.writeFileSync(filePath, content, 'utf-8')
}
