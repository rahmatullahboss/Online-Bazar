import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const REMEMBER_ME_EXPIRATION_SECONDS = 60 * 60 * 24 * 30 // 30 days

function buildTokenCookie(
  token: string,
  cookiePrefix: string | undefined,
  expiresInSeconds: number,
): string {
  const cookieName = `${cookiePrefix || 'payload'}-token`
  const expires = new Date(Date.now() + expiresInSeconds * 1000)

  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`
}

async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get('content-type') || ''
  console.log('Content type:', contentType)

  try {
    if (contentType.includes('application/json') || contentType === '') {
      const rawBody = await request.text()
      console.log('Raw body text:', rawBody)

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(rawBody)
        console.log('Parsed JSON:', parsed)
        // If it has a _payload property, parse that as JSON too
        if (parsed._payload && typeof parsed._payload === 'string') {
          console.log('Parsing _payload as JSON:', parsed._payload)
          return JSON.parse(parsed._payload)
        }
        return parsed
      } catch (jsonError) {
        console.error('Failed to parse as JSON:', jsonError)
        return null
      }
    }

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData()
      const result: Record<string, unknown> = {}

      // Handle the case where we have a _payload field in form data
      const payloadField = formData.get('_payload')
      if (payloadField && typeof payloadField === 'string') {
        try {
          const parsed = JSON.parse(payloadField)
          console.log('Parsed _payload from form data:', parsed)
          return parsed
        } catch (jsonError) {
          console.error('Failed to parse _payload from form data:', jsonError)
        }
      }

      // Fallback to regular form data parsing
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
  } catch (error) {
    console.error('Failed to parse login request body', error)
    return null
  }

  return null
}

export async function POST(request: NextRequest) {
  console.log('Login request received')

  try {
    const body = await parseRequestBody(request)
    console.log('Final parsed body:', body)

    if (!body || typeof body !== 'object') {
      console.log('Invalid request body')
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }

    // Extract email and password from the parsed body
    const emailValue = (body as Record<string, unknown>).email
    const passwordValue = (body as Record<string, unknown>).password
    const rememberMeValue = (body as Record<string, unknown>).rememberMe

    console.log('Raw email value:', emailValue)
    console.log('Raw password value:', passwordValue)

    const email = typeof emailValue === 'string' ? emailValue.trim() : ''
    const password = typeof passwordValue === 'string' ? passwordValue : ''
    const rememberMe =
      rememberMeValue === true ||
      rememberMeValue === 'true' ||
      rememberMeValue === '1' ||
      rememberMeValue === 'on' ||
      rememberMeValue === 1

    console.log('Processed email:', JSON.stringify(email))
    console.log('Processed password:', JSON.stringify(password))
    console.log('Email length:', email.length)
    console.log('Password length:', password.length)

    if (!email || !password) {
      console.log('Email or password missing/empty')
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const usersCollection = payload.collections['users']

    if (!usersCollection?.config?.auth) {
      console.log('Authentication not enabled for users')
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

    // Ensure we receive the token so we can manage the cookie manually
    ;(authConfig as any).removeTokenFromResponses = false

    try {
      console.log('Attempting login with email:', email)
      const result = (await payload.login({
        collection: 'users',
        data: { email, password },
        depth: 0,
      })) as any

      console.log('Login result:', result)

      if (!result?.token) {
        console.log('No token in login result')
        throw new Error('Authentication token was not generated')
      }

      const tokenCookie = buildTokenCookie(
        result.token,
        payload.config.cookiePrefix,
        effectiveExpiration,
      )

      console.log('Token cookie:', tokenCookie)

      const responseBody: Record<string, unknown> = {
        message: 'Login successful',
        user: result.user,
        exp: result.exp,
      }

      const response = NextResponse.json(responseBody, { status: 200 })
      response.headers.append('Set-Cookie', tokenCookie)
      console.log('Login successful, sending response')
      return response
    } catch (error: any) {
      console.error('Login error:', error)
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
  } catch (error: any) {
    console.error('Unexpected error in login route:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
