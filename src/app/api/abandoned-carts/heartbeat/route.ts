import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Heartbeat endpoint to keep carts active
 * This endpoint is called periodically by the client to signal that a cart is still active
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    const body = await request.json().catch(() => ({}))
    const sessionId = body?.sessionId

    console.log('Heartbeat request received', { sessionId })

    if (!sessionId) {
      console.log('Session ID missing from heartbeat request')
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Find the cart by session ID
    const existing = await payload.find({
      collection: 'abandoned-carts',
      limit: 1,
      where: {
        and: [{ sessionId: { equals: String(sessionId) } }, { status: { equals: 'active' } }],
      },
    })

    // If no active cart exists, try to find any cart with this session ID
    if (!existing?.docs?.[0]) {
      console.log('No active cart found, checking for any cart with this session ID')
      const anyCart = await payload.find({
        collection: 'abandoned-carts',
        limit: 1,
        where: {
          sessionId: { equals: String(sessionId) },
        },
      })

      // If no cart exists at all, we can't send a heartbeat
      if (!anyCart?.docs?.[0]) {
        console.log('No cart found with this session ID')
        return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
      }

      // If a cart exists but is not active, we shouldn't send a heartbeat
      // This could happen if the cart was already marked as abandoned or recovered
      const cart = anyCart.docs[0] as any
      console.log('Cart found but not active', { status: cart.status })
      
      // If the cart is already abandoned, return success but indicate it's not active
      if (cart.status === 'abandoned') {
        return NextResponse.json(
          {
            success: true,
            message: 'Cart is already marked as abandoned',
            id: cart.id,
            status: cart.status,
          },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        {
          error: `Cart is not active (status: ${cart.status})`,
        },
        { status: 400 },
      )
    }

    // Update the last activity timestamp to keep the cart active
    const updated = await payload.update({
      collection: 'abandoned-carts',
      id: (existing.docs[0] as any).id,
      data: {
        lastActivityAt: new Date().toISOString(),
        // Ensure status is active when heartbeat is received
        status: 'active',
        notes: 'Heartbeat received - cart is still active',
      },
    })

    console.log('Heartbeat processed successfully', {
      cartId: (updated as any)?.id,
      lastActivityAt: (updated as any)?.lastActivityAt,
    })

    return NextResponse.json({
      success: true,
      id: (updated as any)?.id,
      lastActivityAt: (updated as any)?.lastActivityAt,
    })
  } catch (e) {
    console.error('Heartbeat error:', e)
    return NextResponse.json({ error: 'Failed to process heartbeat' }, { status: 500 })
  }
}

// GET endpoint for manual cleanup trigger
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    // Allow if user is admin or if called with secret
    const url = new URL(request.url)
    const providedSecret = url.searchParams.get('secret')
    const secretOK = !!process.env.CRON_SECRET && providedSecret === process.env.CRON_SECRET

    if ((!user || (user as any).role !== 'admin') && !secretOK) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Default to 30 minutes TTL, but allow customization
    const ttlMinutes = Number(url.searchParams.get('ttlMinutes') || 30)
    const clampedTtl = Math.max(5, Math.min(1440, ttlMinutes))
    const cutoff = new Date(Date.now() - clampedTtl * 60 * 1000).toISOString()

    // Find carts that haven't been active since the cutoff time
    // Limit to 50 carts at a time to avoid resource exhaustion
    const res = await payload.find({
      collection: 'abandoned-carts',
      limit: 50,
      where: {
        and: [{ status: { equals: 'active' } }, { lastActivityAt: { less_than: cutoff } }],
      },
    })

    let updated = 0
    const errors: string[] = []

    // Update carts in batches
    for (const doc of res.docs || []) {
      try {
        await payload.update({
          collection: 'abandoned-carts',
          id: (doc as any).id,
          data: {
            status: 'abandoned',
            notes: `Marked as abandoned automatically after ${clampedTtl} minutes of inactivity (manual trigger)`,
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
    })
  } catch (e) {
    console.error('Manual cleanup error:', e)
    return NextResponse.json({ error: 'Failed to cleanup abandoned carts' }, { status: 500 })
  }
}