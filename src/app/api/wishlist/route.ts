import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create wishlist for user
    const wishlist = await payload.find({
      collection: 'wishlists',
      where: { user: { equals: user.id } },
      limit: 1,
      depth: 2, // Include full item data
    })

    if (wishlist.docs.length === 0) {
      // Create empty wishlist
      const newWishlist = await payload.create({
        collection: 'wishlists',
        data: {
          user: user.id,
          items: [],
        },
      })
      return NextResponse.json({ wishlist: newWishlist, items: [] })
    }

    // Get full item details for wishlist items
    const wishlistDoc = wishlist.docs[0]
    const wishlistItems =
      (wishlistDoc as unknown as { items: { item: unknown; addedAt: string }[] }).items || []

    return NextResponse.json({
      wishlist: wishlistDoc,
      items: wishlistItems,
      itemCount: wishlistItems.length,
    })
  } catch (error) {
    console.error('Failed to get wishlist:', error)
    return NextResponse.json({ error: 'Failed to get wishlist' }, { status: 500 })
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, notifyOnSale, notifyOnStock } = body

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Find or create wishlist
    const wishlist = await payload.find({
      collection: 'wishlists',
      where: { user: { equals: user.id } },
      limit: 1,
    })

    let wishlistDoc
    if (wishlist.docs.length === 0) {
      // Create new wishlist with item
      wishlistDoc = await payload.create({
        collection: 'wishlists',
        data: {
          user: user.id,
          items: [
            {
              item: itemId,
              addedAt: new Date().toISOString(),
              notifyOnSale: notifyOnSale || false,
              notifyOnStock: notifyOnStock || false,
            },
          ],
        },
      })
    } else {
      wishlistDoc = wishlist.docs[0]
      const currentItems = (wishlistDoc as unknown as { items: { item: unknown }[] }).items || []

      // Check if item already exists
      const itemExists = currentItems.some((wishlistItem) => {
        const existingItemId =
          typeof wishlistItem.item === 'object'
            ? (wishlistItem.item as { id: number }).id
            : wishlistItem.item
        return String(existingItemId) === String(itemId)
      })

      if (itemExists) {
        return NextResponse.json({ error: 'Item already in wishlist' }, { status: 400 })
      }

      // Add new item
      wishlistDoc = await payload.update({
        collection: 'wishlists',
        id: wishlistDoc.id,
        data: {
          items: [
            ...currentItems,
            {
              item: itemId,
              addedAt: new Date().toISOString(),
              notifyOnSale: notifyOnSale || false,
              notifyOnStock: notifyOnStock || false,
            },
          ],
        },
      })
    }

    return NextResponse.json({ success: true, wishlist: wishlistDoc })
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Find wishlist
    const wishlist = await payload.find({
      collection: 'wishlists',
      where: { user: { equals: user.id } },
      limit: 1,
    })

    if (wishlist.docs.length === 0) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 })
    }

    const wishlistDoc = wishlist.docs[0]
    const currentItems = (wishlistDoc as unknown as { items: { item: unknown }[] }).items || []

    // Filter out the item to remove
    const updatedItems = currentItems.filter((wishlistItem) => {
      const existingItemId =
        typeof wishlistItem.item === 'object'
          ? (wishlistItem.item as { id: number }).id
          : wishlistItem.item
      return String(existingItemId) !== String(itemId)
    })

    // Update wishlist
    const updatedWishlist = await payload.update({
      collection: 'wishlists',
      id: wishlistDoc.id,
      data: {
        items: updatedItems,
      },
    })

    return NextResponse.json({ success: true, wishlist: updatedWishlist })
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
