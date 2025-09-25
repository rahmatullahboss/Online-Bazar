import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// This endpoint can be called manually to send abandoned cart reminders
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    // Only allow admin users to trigger this
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if email support is available
    if (typeof payload.sendEmail !== 'function') {
      return NextResponse.json({ error: 'Email transport is not configured' }, { status: 500 })
    }

    // Since we can't import the function directly, we'll trigger the existing endpoint
    // This is a workaround to avoid duplicating code
    const reminderResponse = await fetch(`${request.nextUrl.origin}/api/abandoned-carts/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the authorization header
        ...Object.fromEntries(request.headers.entries())
      }
    })

    const reminderData = await reminderResponse.json()
    
    if (reminderResponse.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Abandoned cart reminders sent successfully',
        ...reminderData
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: reminderData.error || 'Failed to send reminders'
      }, { status: reminderResponse.status })
    }
  } catch (error) {
    console.error('Failed to send abandoned cart reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}