import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { OAuth2Client } from 'google-auth-library'

// Type definitions
interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials are not configured')
}

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${NEXT_PUBLIC_SERVER_URL}/api/auth/google/callback`
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ message: 'Authorization code is required' }, { status: 400 })
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google')
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json()

    const payload = await getPayload({ config })
    
    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: userInfo.email,
        },
      },
    })

    let user: any
    let token: string

    if (existingUsers.docs.length > 0) {
      // User exists, log them in
      user = existingUsers.docs[0]
      
      // For OAuth users, we'll generate a token directly
      const result = await payload.auth({
        collection: 'users',
        headers: request.headers,
      })
      
      if (result.user) {
        token = result.token
      } else {
        throw new Error('Failed to authenticate existing user')
      }
    } else {
      // User doesn't exist, create a new account
      // Generate a random password for OAuth users
      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!'
      
      const createUserResult = await payload.create({
        collection: 'users',
        data: {
          email: userInfo.email,
          firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || '',
          lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
          role: 'user',
          password: randomPassword,
        },
      })
      
      user = createUserResult.doc
      
      // Log in the new user
      const loginResult = await payload.login({
        collection: 'users',
        data: {
          email: userInfo.email,
          password: randomPassword,
        },
        depth: 0,
      })
      
      token = loginResult.token
    }

    if (!token) {
      throw new Error('Failed to generate authentication token')
    }

    // Set up the response with the token cookie
    const cookieName = `${payload.config.cookiePrefix || 'payload'}-token`
    const cookieExpiration = new Date(Date.now() + (payload.collections['users']?.config?.auth?.tokenExpiration || 3600) * 1000)
    const tokenCookie = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${cookieExpiration.toUTCString()}`

    const response = NextResponse.json(
      { 
        message: 'Authentication successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      }, 
      { status: 200 }
    )
    
    response.headers.append('Set-Cookie', tokenCookie)
    return response
  } catch (error: any) {
    console.error('Google OAuth error:', error)
    return NextResponse.json(
      { message: error.message || 'Google authentication failed' }, 
      { status: 500 }
    )
  }
}