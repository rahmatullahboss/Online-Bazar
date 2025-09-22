import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Allow if either (a) called by Vercel Cron (x-vercel-cron header) OR (b) secret matches
    const isVercelCron = !!request.headers.get('x-vercel-cron')
    const url = new URL(request.url)
    const providedSecret = url.searchParams.get('secret') || request.headers.get('x-cron-secret')
    const secretOK = !!process.env.CRON_SECRET && providedSecret === process.env.CRON_SECRET

    if (!isVercelCron && !secretOK) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    
    // Log the cron execution data
    console.log('Cron Execution Log:', {
      timestamp: new Date().toISOString(),
      ...body
    })

    return NextResponse.json({
      success: true,
      message: 'Execution logged successfully'
    })
  } catch (e) {
    console.error('Cron execution log error:', e)
    return NextResponse.json({ error: 'Failed to log execution' }, { status: 500 })
  }
}