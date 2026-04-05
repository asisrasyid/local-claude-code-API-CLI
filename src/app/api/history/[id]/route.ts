import { NextRequest, NextResponse } from 'next/server'
import { getSessionContent } from '@/lib/chat-history'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const content = getSessionContent(id)
  if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ content })
}
