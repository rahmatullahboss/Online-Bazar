import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

async function extractEmail(request: NextRequest): Promise<string | null> {
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(async () => {
        // Fallback in case body is not valid JSON
        const text = await request.text()
        try {
          return JSON.parse(text)
        } catch {
          return null
        }
      })
      if (body && typeof body === 'object') return (body as any).email ?? null
      return null
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text()
      const params = new URLSearchParams(text)
      return params.get('email')
    }

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const v = form.get('email')
      return typeof v === 'string' ? v : null
    }

    // Unknown or missing content-type: try text as JSON then as query string
    const raw = await request.text()
    try {
      const parsed = JSON.parse(raw)
      return (parsed as any)?.email ?? null
    } catch {
      const params = new URLSearchParams(raw)
      return params.get('email')
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const email = await extractEmail(request)

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Use Payload's built-in forgot password functionality
    await payload.forgotPassword({
      collection: 'users',
      data: {
        email,
      },
    })

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      {
        message: 'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      {
        message: 'Error sending password reset email. Please check server logs.',
      },
      { status: 500 },
    )
  }
}
