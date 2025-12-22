import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

interface SaveChatRequest {
  sessionId: string
  userId?: number
  guestInfo?: {
    name: string
    phone: string
  }
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SaveChatRequest = await req.json()
    const { sessionId, userId, guestInfo, message } = body

    if (!sessionId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Check if conversation exists
    const existing = await payload.find({
      collection: 'chat-conversations',
      where: { sessionId: { equals: sessionId } },
      limit: 1,
    })

    const newMessage = {
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
    }

    if (existing.docs.length > 0) {
      // Update existing conversation
      const conversation = existing.docs[0]
      const messages = [...(conversation.messages || []), newMessage]

      await payload.update({
        collection: 'chat-conversations',
        id: conversation.id,
        data: {
          messages,
          lastMessageAt: new Date().toISOString(),
        },
      })
    } else {
      // Create new conversation
      await payload.create({
        collection: 'chat-conversations',
        data: {
          sessionId,
          user: userId || null,
          guestInfo: userId ? null : guestInfo,
          messages: [newMessage],
          lastMessageAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving chat:', error)
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 })
  }
}
