import { NextRequest, NextResponse } from 'next/server'
import { listSessions, saveSession } from '@/lib/chat-history'

export async function GET() {
  const sessions = listSessions()
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const { id, title, mode, messages } = await req.json()
  saveSession(id, title, mode, messages)
  return NextResponse.json({ success: true })
}
