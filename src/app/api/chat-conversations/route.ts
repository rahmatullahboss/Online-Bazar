import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const conversations = await payload.find({
      collection: 'chat-conversations',
      sort: '-lastMessageAt',
      limit: 100,
      depth: 1,
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ docs: [], error: 'Failed to fetch' }, { status: 500 })
  }
}
