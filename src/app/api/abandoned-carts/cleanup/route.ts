import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Lightweight endpoint to mark abandoned carts
 * This endpoint is designed to be called periodically by a cron job
 * or manually when needed, without consuming too many resources
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })

    // Allow if either (a) called by Vercel Cron (x-vercel-cron header) OR (b) secret matches
    const url = new URL(request.url)
    const querySecret = url.searchParams.get('secret')
    const headerSecret = request.headers.get('x-cron-secret')
    const envSecret = process.env.CRON_SECRET

    const isVercelCron = !!request.headers.get('x-vercel-cron')
    const secretOK = !!envSecret && (querySecret === envSecret || headerSecret === envSecret)

    if (!isVercelCron && !secretOK) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get TTL from query parameters or default to 30 minutes
    const ttlMinutes = Number(url.searchParams.get('ttlMinutes') || 30)

    // Ensure TTL is within reasonable bounds (5 minutes to 24 hours)
    const clampedTtl = Math.max(5, Math.min(1440, ttlMinutes))
    const cutoff = new Date(Date.now() - clampedTtl * 60 * 1000).toISOString()

    // Find carts that haven't been active since the cutoff time
    // Limit to 100 carts at a time to avoid resource exhaustion
    const res = await payload.find({
      collection: 'abandoned-carts',
      limit: 100,
      where: {
        and: [{ status: { equals: 'active' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    let updated = 0
    const errors: string[] = []

    // Update carts in batches to avoid overwhelming the database
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

    // Deduplicate abandoned carts by email, keeping the most recent
    let duplicatesDeleted = 0
    const abandonedRes = await payload.find({
      collection: 'abandoned-carts',
      where: { status: { equals: 'abandoned' } },
      limit: 100,
    })

    const groups = new Map()
    for (const doc of abandonedRes.docs || []) {
      const email = (doc as any).customerEmail?.trim()
      if (email && email.length > 0) {
        if (!groups.has(email)) groups.set(email, [])
        groups.get(email)!.push(doc)
      }
    }

    for (const [email, carts] of groups) {
      if (carts.length > 1) {
        // Sort by lastActivityAt descending (most recent first)
        carts.sort(
          (a: any, b: any) =>
            new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
        )
        // Delete all except the first (latest)
        for (let i = 1; i < carts.length; i++) {
          try {
            await payload.delete({
              collection: 'abandoned-carts',
              id: (carts[i] as any).id,
            })
            duplicatesDeleted++
          } catch (error) {
            console.error(`Failed to delete duplicate cart ${(carts[i] as any).id}:`, error)
            errors.push(`Failed to delete duplicate cart ${(carts[i] as any).id}`)
          }
        }
      }
    }

    // Delete abandoned carts without email or phone
    let noContactDeleted = 0
    const noContactRes = await payload.find({
      collection: 'abandoned-carts',
      where: {
        status: { equals: 'abandoned' },
        and: [
          {
            or: [{ customerEmail: { equals: null } }, { customerEmail: { equals: '' } }],
          },
          {
            or: [{ customerNumber: { equals: null } }, { customerNumber: { equals: '' } }],
          },
        ],
      },
      limit: 50,
    })

    for (const doc of noContactRes.docs || []) {
      try {
        await payload.delete({
          collection: 'abandoned-carts',
          id: (doc as any).id,
        })
        noContactDeleted++
      } catch (error) {
        console.error(`Failed to delete no-contact cart ${doc.id}:`, error)
        errors.push(`Failed to delete no-contact cart ${(doc as any).id}`)
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      totalChecked: res.docs?.length || 0,
      duplicatesDeleted,
      noContactDeleted,
      cutoff,
      ttlMinutes: clampedTtl,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (e) {
    console.error('Mark abandoned carts error:', e)
    return NextResponse.json({ error: 'Failed to mark carts as abandoned' }, { status: 500 })
  }
}

// GET handler for manual triggering or lightweight checks
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })

    // Allow if either (a) called by Vercel Cron (x-vercel-cron header) OR (b) secret matches
    const url = new URL(request.url)
    const querySecret = url.searchParams.get('secret')
    const headerSecret = request.headers.get('x-cron-secret')
    const envSecret = process.env.CRON_SECRET

    const isVercelCron = !!request.headers.get('x-vercel-cron')
    const secretOK = !!envSecret && (querySecret === envSecret || headerSecret === envSecret)

    if (!isVercelCron && !secretOK) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For GET requests, just return a count of active carts that could be abandoned
    const ttlMinutes = Number(url.searchParams.get('ttlMinutes') || 30)
    const clampedTtl = Math.max(5, Math.min(1440, ttlMinutes))
    const cutoff = new Date(Date.now() - clampedTtl * 60 * 1000).toISOString()

    const res = await payload.find({
      collection: 'abandoned-carts',
      limit: 0, // Just get the count
      where: {
        and: [{ status: { equals: 'active' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    return NextResponse.json({
      success: true,
      count: res.totalDocs,
      cutoff,
      ttlMinutes: clampedTtl,
      via: isVercelCron ? 'vercel-cron' : 'secret',
    })
  } catch (e) {
    console.error('Check abandoned carts error:', e)
    return NextResponse.json({ error: 'Failed to check carts' }, { status: 500 })
  }
}
