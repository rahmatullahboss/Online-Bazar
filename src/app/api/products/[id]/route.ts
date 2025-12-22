import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

// GET /api/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const product = await payload.findByID({
      collection: 'items',
      id,
      depth: 2,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch categories for form
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    return NextResponse.json({ product, categories: categories.docs })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PATCH /api/products/[id] - Update product
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
    const body = await request.json()

    // Build update data
    const updateData: any = {}

    // Basic fields
    if (body.name !== undefined) updateData.name = body.name
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = body.price
    if (body.compareAtPrice !== undefined) updateData.compareAtPrice = body.compareAtPrice
    if (body.category !== undefined) updateData.category = body.category || null
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.available !== undefined) updateData.available = body.available
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.image !== undefined) updateData.image = body.image

    // Inventory management fields
    if (
      body.trackInventory !== undefined ||
      body.stock !== undefined ||
      body.lowStockThreshold !== undefined ||
      body.allowBackorders !== undefined
    ) {
      updateData.inventoryManagement = {
        trackInventory: body.trackInventory,
        stock: body.stock,
        lowStockThreshold: body.lowStockThreshold,
        allowBackorders: body.allowBackorders,
      }
    }

    const product = await payload.update({
      collection: 'items',
      id,
      data: updateData,
    })

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 },
    )
  }
}

// DELETE /api/products/[id] - Delete product
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
      collection: 'items',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
