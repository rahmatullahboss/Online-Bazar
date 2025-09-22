import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * MCP endpoint for cleaning up abandoned carts
 * This endpoint can be called by AI tools through Vercel MCP
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    // Check if user is authenticated (admin access required for MCP tools)
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    // Default to 30 minutes TTL, but allow customization through request body
    const ttlMinutes = Number(body?.ttlMinutes) || 30
    const clampedTtl = Math.max(5, Math.min(1440, ttlMinutes))
    const cutoff = new Date(Date.now() - clampedTtl * 60 * 1000).toISOString()

    // Find carts that haven't been active since the cutoff time
    // Limit to 25 carts at a time to avoid resource exhaustion (MCP friendly)
    const res = await payload.find({
      collection: 'abandoned-carts',
      limit: 25,
      where: {
        and: [{ status: { equals: 'active' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    let updated = 0
    const errors: string[] = []
    const processedCarts: { id: number; sessionId: string; customerEmail?: string }[] = []

    // Update carts in batches
    for (const doc of res.docs || []) {
      try {
        await payload.update({
          collection: 'abandoned-carts',
          id: (doc as any).id,
          data: {
            status: 'abandoned',
            notes: `Marked as abandoned automatically after ${clampedTtl} minutes of inactivity (MCP trigger)`,
          },
        })
        updated++

        // Collect information about processed carts
        processedCarts.push({
          id: (doc as any).id,
          sessionId: (doc as any).sessionId,
          customerEmail: (doc as any).customerEmail,
        })
      } catch (error) {
        console.error(`Failed to update cart ${doc.id}:`, error)
        errors.push(`Failed to update cart ${(doc as any).id}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${updated} abandoned carts out of ${res.docs?.length || 0} checked carts`,
      updated,
      totalChecked: res.docs?.length || 0,
      cutoff,
      ttlMinutes: clampedTtl,
      processedCarts,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (e) {
    console.error('MCP cleanup error:', e)
    return NextResponse.json(
      { error: 'Failed to cleanup abandoned carts via MCP' },
      { status: 500 },
    )
  }
}

/**
 * GET endpoint for documentation and testing
 */
export async function GET() {
  return NextResponse.json({
    name: 'Vercel MCP Abandoned Cart Cleanup Tool',
    description: 'Marks inactive carts as abandoned based on inactivity timeout',
    parameters: {
      ttlMinutes: {
        type: 'number',
        description:
          'Time in minutes after which inactive carts are marked as abandoned (default: 30, min: 5, max: 1440)',
        default: 30,
      },
    },
    usage: {
      method: 'POST',
      example: {
        ttlMinutes: 30,
      },
    },
  })
}
