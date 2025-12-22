import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

// PATCH /api/abandoned-carts/[id]/recover - Mark cart as recovered after phone call/manual confirmation
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    // Update cart to recovered status
    const cart = await payload.update({
      collection: 'abandoned-carts',
      id,
      data: {
        status: 'recovered',
        notes:
          body.notes || `Manually marked as recovered by admin at ${new Date().toLocaleString()}`,
      },
    })

    return NextResponse.json({
      success: true,
      cart,
      message: 'Cart marked as recovered',
    })
  } catch (error) {
    console.error('Error recovering cart:', error)
    return NextResponse.json({ error: 'Failed to recover cart' }, { status: 500 })
  }
}

// DELETE /api/abandoned-carts/[id] - Delete cart (for cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await payload.delete({
      collection: 'abandoned-carts',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cart:', error)
    return NextResponse.json({ error: 'Failed to delete cart' }, { status: 500 })
  }
}
