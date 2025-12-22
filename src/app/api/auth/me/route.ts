import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    // Verify token and get user
    const { user } = await payload.auth({
      headers: new Headers({ cookie: `payload-token=${token}` }),
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Get full user data with firstName/lastName
    const userData = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    const fullName =
      userData?.firstName && userData?.lastName
        ? `${userData.firstName} ${userData.lastName}`.trim()
        : userData?.firstName || user.email?.split('@')[0] || 'User'

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: fullName,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null })
  }
}
