import { headers as getHeaders } from 'next/headers.js'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {}
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 })
    }

    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
    })

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    if (String((order as any).user) !== String((user as any).id)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    if ((order as any).status !== 'pending') {
      return NextResponse.json({ message: 'Only pending orders can be cancelled' }, { status: 400 })
    }

    const updatedOrder = await payload.update({
      collection: 'orders',
      id: orderId,
      data: { status: 'cancelled' },
      overrideAccess: true,
      user,
    })

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 })
  } catch (error) {
    console.error('Order cancel error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

