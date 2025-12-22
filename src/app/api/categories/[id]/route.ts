import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

// PATCH /api/categories/[id] - Update category
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

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const category = await payload.update({
      collection: 'categories',
      id,
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || undefined,
      },
    })

    return NextResponse.json({ category })
  } catch (error: any) {
    if (error.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/categories/[id] - Delete category
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

    // Check if any products use this category
    const productsWithCategory = await payload.find({
      collection: 'items',
      where: { category: { equals: id } },
      limit: 1,
    })

    if (productsWithCategory.totalDocs > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with products. Remove products from this category first.',
        },
        { status: 400 },
      )
    }

    await payload.delete({
      collection: 'categories',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
