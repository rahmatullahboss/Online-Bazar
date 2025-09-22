import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })

    // Allow if either (a) called by Vercel Cron (x-vercel-cron header) OR (b) secret matches
    const isVercelCron = !!request.headers.get('x-vercel-cron')
    const url = new URL(request.url)
    const querySecret = url.searchParams.get('secret')
    const headerSecret = request.headers.get('x-cron-secret')
    const envSecret = process.env.CRON_SECRET

    const secretOK = !!envSecret && (querySecret === envSecret || headerSecret === envSecret)

    if (!isVercelCron && !secretOK) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get TTL from query parameters or default to 30 minutes
    const ttlMinutes = Number(url.searchParams.get('ttlMinutes') || 30)
    const clampedTtl = Math.max(5, Math.min(1440, ttlMinutes))
    const cutoff = new Date(Date.now() - clampedTtl * 60 * 1000).toISOString()

    // Get counts for different cart statuses
    const activeCarts = await payload.find({
      collection: 'abandoned-carts',
      limit: 0, // Just get the count
      where: {
        and: [{ status: { equals: 'active' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    const abandonedCarts = await payload.find({
      collection: 'abandoned-carts',
      limit: 0, // Just get the count
      where: {
        status: { equals: 'abandoned' },
      },
    })

    const recoveredCarts = await payload.find({
      collection: 'abandoned-carts',
      limit: 0, // Just get the count
      where: {
        status: { equals: 'recovered' },
      },
    })

    const pendingCleanup = await payload.find({
      collection: 'abandoned-carts',
      limit: 0, // Just get the count
      where: {
        and: [{ status: { equals: 'active' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        active: activeCarts.totalDocs,
        abandoned: abandonedCarts.totalDocs,
        recovered: recoveredCarts.totalDocs,
        pendingCleanup: pendingCleanup.totalDocs,
        ttlMinutes: clampedTtl,
        cutoff,
      },
      via: isVercelCron ? 'vercel-cron' : 'secret',
    })
  } catch (e) {
    console.error('Cart status check error:', e)
    return NextResponse.json({ error: 'Failed to check cart status' }, { status: 500 })
  }
}