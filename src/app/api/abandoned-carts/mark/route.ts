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
    let deleted = 0
    const errors: string[] = []
    for (const doc of res.docs || []) {
      try {
        // Check if the cart is empty
        const cartItems = Array.isArray((doc as any).items) ? (doc as any).items : []
        const hasItems = cartItems.length > 0
        
        if (hasItems) {
          // Mark as abandoned if it has items
          await payload.update({
            collection: 'abandoned-carts',
            id: (doc as any).id,
            data: {
              status: 'abandoned',
              notes: `Marked as abandoned automatically after ${clampedTtl} minutes of inactivity`,
            },
          })
          updated++
        } else {
          // Delete empty carts
          await payload.delete({
            collection: 'abandoned-carts',
            id: (doc as any).id,
          })
          deleted++
        }
      } catch (error) {
        console.error(`Failed to process cart ${doc.id}:`, error)
        errors.push(`Failed to process cart ${(doc as any).id}`)
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      deleted,
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

    // Improved authentication logic for Vercel Cron
    const isVercelCron = !!request.headers.get('x-vercel-cron')
    
    // Check for other possible Vercel identifiers
    const vercelHeaders = [
      'x-vercel-id',
      'x-vercel-deployment-url',
      'x-vercel-forwarded-proto',
      'x-vercel-proxy-signature',
      'x-vercel-sc-host'
    ]
    
    const hasVercelHeader = vercelHeaders.some(header => request.headers.get(header))
    
    // Check user agent for Vercel
    const userAgent = request.headers.get('user-agent') || ''
    const isVercelAgent = userAgent.includes('vercel') || userAgent.includes('Vercel')
    
    // Check if the request is coming from Vercel's IP ranges
    const xForwardedFor = request.headers.get('x-forwarded-for') || ''
    const isVercelIP = xForwardedFor.includes('vercel') || xForwardedFor.includes('zeit') || xForwardedFor.includes('now')
    
    // Secret-based authentication for manual testing
    const url = new URL(request.url)
    const providedSecret = url.searchParams.get('secret') || request.headers.get('x-cron-secret')
    const secretOK = !!process.env.CRON_SECRET && providedSecret === process.env.CRON_SECRET
    
    // Debug logging
    console.log('Mark route authorization debug:', {
      isVercelCron,
      hasVercelHeader,
      isVercelAgent,
      isVercelIP,
      secretOK,
      providedSecret: providedSecret ? '***' : null,
      userAgent: userAgent.substring(0, 100),
      xForwardedFor: xForwardedFor.substring(0, 100)
    })
    
    // Allow if it's a Vercel cron job, internal request, or has the correct secret
    const isAuthorized = isVercelCron || hasVercelHeader || isVercelAgent || isVercelIP || secretOK
    const via = isVercelCron ? 'vercel-cron' : 'secret'
    
    if (!isAuthorized) {
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
    let deleted = 0
    const errors: string[] = []
    for (const doc of res.docs || []) {
      try {
        // Check if the cart is empty
        const cartItems = Array.isArray((doc as any).items) ? (doc as any).items : []
        const hasItems = cartItems.length > 0
        
        if (hasItems) {
          // Mark as abandoned if it has items
          await payload.update({
            collection: 'abandoned-carts',
            id: (doc as any).id,
            data: {
              status: 'abandoned',
              notes: `Marked as abandoned automatically after ${clampedTtl} minutes of inactivity`,
            },
          })
          updated++
        } else {
          // Delete empty carts
          await payload.delete({
            collection: 'abandoned-carts',
            id: (doc as any).id,
          })
          deleted++
        }
      } catch (error) {
        console.error(`Failed to process cart ${doc.id}:`, error)
        errors.push(`Failed to process cart ${(doc as any).id}`)
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      deleted,
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
