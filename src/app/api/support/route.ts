import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get user from the request (optional for guest support)
    const { user } = await payload.auth({ headers: request.headers })

    // Parse body
    const contentType = (request.headers.get('content-type') || '').toLowerCase()
    let body: any = {}
    try {
      if (contentType.includes('application/json')) {
        body = await request.json()
      } else {
        const txt = await request.text()
        try {
          body = JSON.parse(txt)
        } catch {
          body = {}
        }
      }
    } catch {
      body = {}
    }

    const { subject, message, email } = body

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // For guests, require email
    if (!user && (!email || typeof email !== 'string' || email.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Email is required for guest submissions' },
        { status: 400 },
      )
    }

    // Create the support ticket
    const supportTicket = await payload.create({
      collection: 'support',
      data: {
        subject: String(subject).trim(),
        message: String(message).trim(),
        ...(user ? { user: user.id } : {}),
        ...(email && !user ? { email: email.trim() } : {}),
      } as any,
    })

    return NextResponse.json({ success: true, doc: supportTicket })
  } catch (error) {
    console.error('Support ticket creation error:', error)
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get user from the request
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's support tickets
    const tickets = await payload.find({
      collection: 'support',
      where: {
        user: {
          equals: user.id,
        },
      },
      sort: '-createdAt',
    })

    return NextResponse.json({ tickets: tickets.docs })
  } catch (error) {
    console.error('Support tickets fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 })
  }
}
