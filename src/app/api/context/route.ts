import { NextResponse } from 'next/server'
import { loadContextFiles } from '@/lib/context-loader'

export async function GET() {
  const files = await loadContextFiles()
  return NextResponse.json(
    files.map(f => ({
      filename: f.filename,
      charCount: f.content.length,
      lastModified: f.lastModified,
      loaded: f.content !== '[File not found]',
    }))
  )
}
