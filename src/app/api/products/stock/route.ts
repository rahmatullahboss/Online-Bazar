import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

// PATCH /api/products/stock - Bulk stock update
export async function PATCH(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Single product stock update
    if (body.productId && body.stock !== undefined) {
      const product = await payload.update({
        collection: 'items',
        id: body.productId,
        data: {
          inventoryManagement: {
            stock: body.stock,
          },
        },
      })

      return NextResponse.json({ product })
    }

    // Bulk stock update
    if (body.updates && Array.isArray(body.updates)) {
      const results = await Promise.all(
        body.updates.map(async (update: { id: string; stock: number }) => {
          try {
            await payload.update({
              collection: 'items',
              id: update.id,
              data: {
                inventoryManagement: {
                  stock: update.stock,
                },
              },
            })
            return { id: update.id, success: true }
          } catch (error) {
            return { id: update.id, success: false, error: 'Update failed' }
          }
        }),
      )

      return NextResponse.json({ results })
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide productId and stock, or updates array.' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}
