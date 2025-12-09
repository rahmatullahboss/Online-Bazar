import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const REMEMBER_ME_EXPIRATION_SECONDS = 60 * 60 * 24 * 30 // 30 days

function buildTokenCookie(
  token: string,
  cookiePrefix: string | undefined,
  expiresInSeconds: number,
  isSecure: boolean = false,
): string {
  const cookieName = `${cookiePrefix || 'payload'}-token`
  const expires = new Date(Date.now() + expiresInSeconds * 1000)
  
  const secureFlag = isSecure ? '; Secure' : ''
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Expires=${expires.toUTCString()}`
}

async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json') || contentType === '') {
      const rawBody = await request.text()

      try {
        const parsed = JSON.parse(rawBody)
        if (parsed._payload && typeof parsed._payload === 'string') {
          return JSON.parse(parsed._payload)
        }
        return parsed
      } catch {
        return null
      }
    }

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData()
      const result: Record<string, unknown> = {}

      const payloadField = formData.get('_payload')
      if (payloadField && typeof payloadField === 'string') {
        try {
          return JSON.parse(payloadField)
        } catch {
          // Fall through to regular form data parsing
        }
      }

      for (const [key, value] of formData.entries()) {
        result[key] = typeof value === 'string' ? value : value.name
      }

      return result
    }

    if (contentType.includes('text/plain')) {
      const text = await request.text()
      if (text.trim().length === 0) return {}
      return JSON.parse(text)
    }
  } catch {
    return null
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request)

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }

    const emailValue = (body as Record<string, unknown>).email
    const passwordValue = (body as Record<string, unknown>).password
    const rememberMeValue = (body as Record<string, unknown>).rememberMe

    const email = typeof emailValue === 'string' ? emailValue.trim() : ''
    const password = typeof passwordValue === 'string' ? passwordValue : ''
    const rememberMe =
      rememberMeValue === true ||
      rememberMeValue === 'true' ||
      rememberMeValue === '1' ||
      rememberMeValue === 'on' ||
      rememberMeValue === 1

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const usersCollection = payload.collections['users']

    if (!usersCollection?.config?.auth) {
      return NextResponse.json(
        { message: 'Authentication is not enabled for users.' },
        { status: 500 },
      )
    }

    const authConfig = usersCollection.config.auth
    const originalExpiration = authConfig.tokenExpiration
    const originalRemoveToken = authConfig.removeTokenFromResponses === true
    const effectiveExpiration = rememberMe ? REMEMBER_ME_EXPIRATION_SECONDS : originalExpiration

    if (rememberMe) {
      authConfig.tokenExpiration = REMEMBER_ME_EXPIRATION_SECONDS
    }

    ;(authConfig as any).removeTokenFromResponses = false

    try {
      const result = (await payload.login({
        collection: 'users',
        data: { email, password },
        depth: 0,
      })) as any

      if (!result?.token) {
        throw new Error('Authentication token was not generated')
      }

      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      const isSecure = serverUrl.startsWith('https')
      
      const tokenCookie = buildTokenCookie(
        result.token,
        payload.config.cookiePrefix,
        effectiveExpiration,
        isSecure,
      )

      const responseBody: Record<string, unknown> = {
        message: 'Login successful',
        user: result.user,
        exp: result.exp,
      }

      const response = NextResponse.json(responseBody, { status: 200 })
      response.headers.append('Set-Cookie', tokenCookie)
      return response
    } catch (error: any) {
      const status = error?.status ?? error?.statusCode ?? 401
      const message =
        typeof error?.message === 'string' && error.message.trim().length > 0
          ? error.message
          : 'Login failed. Please check your credentials.'
      return NextResponse.json({ message }, { status })
    } finally {
      authConfig.tokenExpiration = originalExpiration
      ;(authConfig as any).removeTokenFromResponses = originalRemoveToken
    }
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
