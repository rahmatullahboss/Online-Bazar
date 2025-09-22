import { NextRequest, NextResponse } from 'next/server'

import { extractClientIdFromCookieHeader, sendGaEvent } from '@/lib/server/ga'

interface TrackingEvent {
  name?: unknown
  params?: unknown
  clientId?: unknown
  userId?: unknown
}

const sanitizeEvent = (event: TrackingEvent) => {
  if (!event || typeof event !== 'object') return null
  if (typeof event.name !== 'string' || event.name.trim().length === 0) return null
  const payload: {
    name: string
    params?: Record<string, unknown>
    clientId?: string
    userId?: string
  } = {
    name: event.name.trim(),
  }
  if (event.params && typeof event.params === 'object' && !Array.isArray(event.params)) {
    payload.params = event.params as Record<string, unknown>
  }
  if (typeof event.clientId === 'string') {
    payload.clientId = event.clientId
  }
  if (typeof event.userId === 'string') {
    payload.userId = event.userId
  }
  return payload
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const events: TrackingEvent[] = Array.isArray((body as any)?.events) ? ((body as any).events as TrackingEvent[]) : []

    if (!events.length) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 })
    }

    const fallbackClientId = extractClientIdFromCookieHeader(req.headers.get('cookie'))

    await Promise.all(
      events
        .map(sanitizeEvent)
        .filter((event): event is { name: string; params?: Record<string, unknown>; clientId?: string; userId?: string } => !!event)
        .map((event) =>
          sendGaEvent({
            name: event.name,
            params: event.params,
            clientId: event.clientId || fallbackClientId,
            userId: event.userId,
          }),
        ),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tracking route error:', error)
    return NextResponse.json({ error: 'Failed to process events' }, { status: 500 })
  }
}

