const API_ENDPOINT = 'https://www.google-analytics.com/mp/collect'

const measurementId = process.env.GA_MEASUREMENT_ID || process.env.GTM_MEASUREMENT_ID
const apiSecret = process.env.GA_API_SECRET || process.env.GTM_API_SECRET

const ensureClientId = (clientId?: string) => {
  if (clientId && /^\d+\.\d+$/.test(clientId)) {
    return clientId
  }
  const rand = Math.floor(Math.random() * 10 ** 10)
  const timestamp = Date.now()
  return `${rand}.${timestamp}`
}

export const sendGaEvent = async (event: {
  name: string
  params?: Record<string, unknown>
  clientId?: string
  userId?: string
  timestampMicros?: string | number
}) => {
  if (!measurementId || !apiSecret) return

  const url = `${API_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`
  const payload: Record<string, unknown> = {
    client_id: ensureClientId(event.clientId),
    events: [
      {
        name: event.name,
        params: event.params ?? {},
      },
    ],
  }

  if (event.userId) {
    payload.user_id = event.userId
  }

  if (event.timestampMicros) {
    payload.timestamp_micros = `${event.timestampMicros}`
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
  } catch (error) {
    console.warn('Failed to forward GA event', error)
  }
}

export const extractClientIdFromCookieHeader = (cookieHeader?: string | null) => {
  if (!cookieHeader) return undefined
  try {
    const cookies = cookieHeader.split(';').map((part) => part.trim())
    const gaCookie = cookies.find((cookie) => cookie.startsWith('_ga='))
    if (!gaCookie) return undefined
    const raw = decodeURIComponent(gaCookie.split('=')[1] ?? '')
    const segments = raw.split('.')
    if (segments.length >= 4) {
      return `${segments[2]}.${segments[3]}`
    }
    if (segments.length === 2) {
      return `${segments[0]}.${segments[1]}`
    }
  } catch {
    return undefined
  }
  return undefined
}
