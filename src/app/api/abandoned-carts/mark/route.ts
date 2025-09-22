import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const ttlMinutes = Number(url.searchParams.get('ttlMinutes') || 60)
    // Ensure TTL is within reasonable bounds (5 minutes to 24 hours)
    const clampedTtl = Math.max(5, Math.min(1440, ttlMinutes))
    const cutoff = new Date(Date.now() - clampedTtl * 60 * 1000).toISOString()

    // Limit to 100 carts at a time to avoid resource exhaustion on Vercel free plan
    const res = await payload.find({
      collection: 'abandoned-carts',
      limit: 100,
      where: {
        and: [{ status: { not_equals: 'recovered' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    let updated = 0
    const errors: string[] = []
    for (const doc of res.docs || []) {
      try {
        await payload.update({
          collection: 'abandoned-carts',
          id: (doc as any).id,
          data: {
            status: 'abandoned',
            notes: `Marked as abandoned automatically after ${clampedTtl} minutes of inactivity`,
          },
        })
        updated++
      } catch (error) {
        console.error(`Failed to update cart ${doc.id}:`, error)
        errors.push(`Failed to update cart ${(doc as any).id}`)
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      totalChecked: res.docs?.length || 0,
      cutoff,
      ttlMinutes: clampedTtl,
      errors: errors.length > 0 ? errors : undefined,
      note: "Note: Vercel free plan doesn't support cron jobs. Consider using the MCP tool at /api/mcp/abandoned-carts/cleanup for on-demand cleanup.",
    })
  } catch (e) {
    console.error('Mark abandoned error:', e)
    return NextResponse.json({ error: 'Failed to mark carts' }, { status: 500 })
  }
}

// GET handler for Vercel Cron or secret-triggered runs
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })

    // Allow if either (a) called by Vercel Cron (x-vercel-cron header) OR (b) secret matches
    const isVercelCron = !!request.headers.get('x-vercel-cron')
    const url = new URL(request.url)
    const providedSecret = url.searchParams.get('secret') || request.headers.get('x-cron-secret')
    const secretOK = !!process.env.CRON_SECRET && providedSecret === process.env.CRON_SECRET
    if (!isVercelCron && !secretOK) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ttlMinutes = Number(url.searchParams.get('ttlMinutes') || 60)
    // Ensure TTL is within reasonable bounds (5 minutes to 24 hours)
    const clampedTtl = Math.max(5, Math.min(1440, ttlMinutes))
    const cutoff = new Date(Date.now() - clampedTtl * 60 * 1000).toISOString()

    // Limit to 100 carts at a time to avoid resource exhaustion on Vercel free plan
    const res = await payload.find({
      collection: 'abandoned-carts',
      limit: 100,
      where: {
        and: [{ status: { not_equals: 'recovered' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    let updated = 0
    const errors: string[] = []
    for (const doc of res.docs || []) {
      try {
        await payload.update({
          collection: 'abandoned-carts',
          id: (doc as any).id,
          data: {
            status: 'abandoned',
            notes: `Marked as abandoned automatically after ${clampedTtl} minutes of inactivity`,
          },
        })
        updated++
      } catch (error) {
        console.error(`Failed to update cart ${doc.id}:`, error)
        errors.push(`Failed to update cart ${(doc as any).id}`)
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      totalChecked: res.docs?.length || 0,
      cutoff,
      ttlMinutes: clampedTtl,
      errors: errors.length > 0 ? errors : undefined,
      via: isVercelCron ? 'vercel-cron' : 'secret',
      note: "Note: Vercel free plan doesn't support cron jobs. Consider using the MCP tool at /api/mcp/abandoned-carts/cleanup for on-demand cleanup.",
    })
  } catch (e) {
    console.error('Mark abandoned (GET) error:', e)
    return NextResponse.json({ error: 'Failed to mark carts' }, { status: 500 })
  }
}
