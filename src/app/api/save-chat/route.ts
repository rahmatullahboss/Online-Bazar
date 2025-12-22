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

    // Find existing conversation by USER ID or GUEST PHONE (not sessionId)
    // This ensures all messages from same user go to same conversation
    let existingConversation = null

    if (userId) {
      // For logged in users - find by userId
      const userConversations = await payload.find({
        collection: 'chat-conversations',
        where: { user: { equals: userId } },
        limit: 1,
        sort: '-lastMessageAt',
      })
      if (userConversations.docs.length > 0) {
        existingConversation = userConversations.docs[0]
      }
    } else if (guestInfo?.phone) {
      // For guests - find by phone number
      const guestConversations = await payload.find({
        collection: 'chat-conversations',
        where: { 'guestInfo.phone': { equals: guestInfo.phone } },
        limit: 1,
        sort: '-lastMessageAt',
      })
      if (guestConversations.docs.length > 0) {
        existingConversation = guestConversations.docs[0]
      }
    } else {
      // Fallback to sessionId if no user/guest info
      const sessionConversations = await payload.find({
        collection: 'chat-conversations',
        where: { sessionId: { equals: sessionId } },
        limit: 1,
      })
      if (sessionConversations.docs.length > 0) {
        existingConversation = sessionConversations.docs[0]
      }
    }

    const newMessage = {
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
    }

    if (existingConversation) {
      // Update existing conversation - add message to existing messages
      const messages = [...(existingConversation.messages || []), newMessage]

      await payload.update({
        collection: 'chat-conversations',
        id: existingConversation.id,
        data: {
          messages,
          lastMessageAt: new Date().toISOString(),
          // Don't update sessionId - it's unique and causes validation errors
        },
      })
    } else {
      // Create new conversation
      await payload.create({
        collection: 'chat-conversations',
        data: {
          sessionId,
          user: userId || null,
          guestInfo: userId ? undefined : guestInfo || undefined,
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
