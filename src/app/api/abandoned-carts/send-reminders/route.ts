import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { runReminderJob } from '../reminders/route'

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

    // Run the reminder job
    const outcome = await runReminderJob(payload)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Abandoned cart reminders sent successfully',
      ...outcome 
    })
  } catch (error) {
    console.error('Failed to send abandoned cart reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}