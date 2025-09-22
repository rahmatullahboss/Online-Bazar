import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const { user } = await payload.auth({ headers: request.headers })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { item, rating, title, comment } = body || {}
    const itemId = typeof item === 'string' ? parseInt(item, 10) : item
    if (!itemId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const numericRating = Number(rating)
    if (!(numericRating >= 1 && numericRating <= 5)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    // Verify user purchased the item with a completed order (server-side guard)
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { user: { equals: (user as any).id } },
          { status: { equals: 'completed' } },
          { 'items.item': { equals: itemId } },
        ],
      },
      limit: 1,
    })
    if (!orders?.docs?.length) {
      return NextResponse.json({ error: 'Review allowed after completed purchase' }, { status: 403 })
    }

    // Ensure item exists
    try {
      await payload.findByID({ collection: 'items', id: itemId })
    } catch {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
    }

    const doc = await payload.create({
      collection: 'reviews',
      data: {
        item: itemId,
        user: (user as any).id,
        rating: numericRating,
        title: title || undefined,
        comment,
        approved: false, // Require admin approval
      } as any,
    })

    return NextResponse.json({ success: true, review: doc })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Optional: list approved reviews for an item via query `?item=...`
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { searchParams } = new URL(request.url)
    const item = searchParams.get('item')
    if (!item) return NextResponse.json({ error: 'Missing item' }, { status: 400 })

    const result = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { item: { equals: item } },
          { approved: { equals: true } },
        ],
      },
      depth: 1,
      sort: '-createdAt',
      limit: 50,
    })
    return NextResponse.json({ reviews: result.docs })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
