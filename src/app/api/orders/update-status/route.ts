import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

import config from '@/payload.config'

export async function PATCH(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ message: 'Order ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    // Update the order
    const updatedOrder = await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      orderId: orderId,
      newStatus: status,
      order: updatedOrder
    }, { status: 200 })
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
