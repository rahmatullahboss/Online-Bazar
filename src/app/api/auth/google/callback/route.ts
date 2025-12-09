import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Simple JWT creation using native crypto
function createJWT(payload: object, secret: string, expiresInDays = 7): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInDays * 24 * 60 * 60,
  }

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url')

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url')

  return `${base64Header}.${base64Payload}.${signature}`
}

export async function GET(request: NextRequest) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, serverUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', serverUrl))
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${serverUrl}/api/auth/google/callback`

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokens)
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', serverUrl))
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const googleUser = await userInfoResponse.json()

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/login?error=no_email', serverUrl))
    }

    // Get Payload instance
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Check if user exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: googleUser.email } },
      limit: 1,
    })

    let user = existingUsers.docs[0]

    if (!user) {
      // Create new user with Google OAuth
      user = await payload.create({
        collection: 'users',
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'Google',
          lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || 'User',
          password: `oauth_${googleUser.sub}_${Math.random().toString(36).slice(-8)}`, // Random password for OAuth users
          role: 'user',
          deliveryZone: 'inside_dhaka',
        },
      })
    }

    // Create JWT token using native crypto
    const secret = process.env.PAYLOAD_SECRET || ''
    const token = createJWT(
      {
        id: user.id,
        email: user.email,
        collection: 'users',
      },
      secret
    )

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/', serverUrl))

    // Set the auth cookie
    const cookieStore = await cookies()
    cookieStore.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', serverUrl))
  }
}
