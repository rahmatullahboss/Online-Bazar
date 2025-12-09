import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import crypto from 'crypto'

// Generate a deterministic password for OAuth users based on their Google sub ID
function getOAuthPassword(googleSub: string): string {
  const secret = process.env.PAYLOAD_SECRET || 'oauth-secret'
  return crypto.createHmac('sha256', secret).update(`oauth:${googleSub}`).digest('hex')
}

export async function GET(request: NextRequest) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  console.log('OAuth callback received, code present:', !!code)

  if (error) {
    console.log('OAuth error:', error)
    return NextResponse.redirect(new URL(`/login?error=${error}`, serverUrl))
  }

  if (!code) {
    console.log('No code received')
    return NextResponse.redirect(new URL('/login?error=no_code', serverUrl))
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${serverUrl}/api/auth/google/callback`

    console.log('Exchanging code for tokens...')

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

    console.log('Token exchange successful')

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const googleUser = await userInfoResponse.json()
    console.log('Google user info:', { email: googleUser.email, sub: googleUser.sub })

    if (!googleUser.email || !googleUser.sub) {
      console.log('No email or sub in Google response')
      return NextResponse.redirect(new URL('/login?error=no_email', serverUrl))
    }

    // Get Payload instance
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Generate deterministic password for this OAuth user
    const oauthPassword = getOAuthPassword(googleUser.sub)

    // Check if user exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: googleUser.email } },
      limit: 1,
    })

    let user = existingUsers.docs[0]
    console.log('Existing user found:', !!user)

    if (!user) {
      // Create new user with deterministic OAuth password
      console.log('Creating new user...')
      user = await payload.create({
        collection: 'users',
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'Google',
          lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || 'User',
          password: oauthPassword,
          role: 'user',
          deliveryZone: 'inside_dhaka',
        },
      })
      console.log('New user created:', user.id)
    } else {
      // Update password for existing OAuth user (in case they registered differently before)
      console.log('Updating existing user password for OAuth...')
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password: oauthPassword,
        },
      })
    }

    // Now login using Payload's built-in login to get a proper token
    console.log('Logging in with Payload...')
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: googleUser.email,
        password: oauthPassword,
      },
    })

    if (!loginResult.token) {
      console.error('No token received from Payload login')
      return NextResponse.redirect(new URL('/login?error=no_token', serverUrl))
    }

    console.log('Payload login successful, token received')

    // Create redirect response with proper cookie
    const response = NextResponse.redirect(new URL('/', serverUrl))
    
    // Set cookie using Next.js cookies API for better compatibility
    const cookiePrefix = payload.config.cookiePrefix || 'payload'
    const cookieName = `${cookiePrefix}-token`
    const isProduction = serverUrl.startsWith('https')
    
    response.cookies.set(cookieName, loginResult.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    })
    
    console.log('Cookie set with Next.js cookies API, redirecting to /')

    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', serverUrl))
  }
}
