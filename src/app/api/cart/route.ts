import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  findActiveCartForUser,
  findCartBySession,
  createNewCart,
  extractCartQuantities,
  resolveCartPayload,
  getSessionIdFromDoc,
  generateSessionId,
  getDocId,
} from './cart-helpers'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    const userId = user?.id
    const sessionCandidate = request.cookies.get('dyad_cart_sid')?.value

    let cartDoc: Record<string, unknown> | null = null

    if (userId) {
      cartDoc = await findActiveCartForUser(payload, userId)
    }

    if (!cartDoc && sessionCandidate) {
      cartDoc = await findCartBySession(payload, sessionCandidate)
    }

    const quantityMap = extractCartQuantities(cartDoc)
    const {
      serialized,
      total: computedTotal,
      snapshot,
    } = await resolveCartPayload(payload, quantityMap)

    const totalRaw = typeof cartDoc?.['cartTotal'] === 'number' ? cartDoc['cartTotal'] : undefined
    const total = typeof totalRaw === 'number' ? totalRaw : computedTotal

    const resolvedSessionId =
      getSessionIdFromDoc(cartDoc) ??
      sessionCandidate ??
      (serialized.length > 0 ? generateSessionId() : null)

    const response = NextResponse.json({
      items: serialized,
      total,
      sourceUpdatedAt: typeof cartDoc?.['updatedAt'] === 'string' ? cartDoc['updatedAt'] : null,
      sessionId: resolvedSessionId,
      snapshot,
    })

    return response
  } catch (error) {
    console.error('Failed to load persisted cart:', error)
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: req.headers })
    const body = await req.json()
    const cartSessionId = req.cookies.get('dyad_cart_sid')?.value

    let cart

    if (user) {
      cart = await findActiveCartForUser(payload, user.id)
      // If we have both a user cart and a session cart, merge them
      if (cart && cartSessionId && cartSessionId !== getSessionIdFromDoc(cart)) {
        const sessionCart = await findCartBySession(payload, cartSessionId)
        const cartId = getDocId(cart)
        const sessionId = getDocId(sessionCart)

        if (sessionCart && cartId && sessionId && cartId !== sessionId) {
          // Merge items from session cart to user cart
          const userQuantities = extractCartQuantities(cart)
          const sessionQuantities = extractCartQuantities(sessionCart)

          // Combine quantities (user cart takes precedence)
          const mergedQuantities = new Map(userQuantities)
          for (const [itemId, quantity] of sessionQuantities.entries()) {
            mergedQuantities.set(itemId, (mergedQuantities.get(itemId) ?? 0) + quantity)
          }

          // Convert to cart items format with proper item IDs
          const mergedItems = Array.from(mergedQuantities.entries()).map(([item, quantity]) => ({
            item, // This should be the numeric ID
            quantity,
          }))

          // Update the user's cart with merged items
          if (cartId) {
            await payload.update({
              collection: 'abandoned-carts',
              id: cartId,
              data: {
                items: mergedItems,
                status: 'active',
                lastActivityAt: new Date().toISOString(),
              },
            })
          }

          // Mark session cart as recovered
          if (sessionId) {
            await payload.update({
              collection: 'abandoned-carts',
              id: sessionId,
              data: {
                status: 'recovered',
              },
            })
          }
        }
      }
    } else if (cartSessionId) {
      cart = await findCartBySession(payload, cartSessionId)
    }

    if (!cart) {
      cart = await createNewCart(payload, user?.id)
    }

    const { items: cartItems, customerName, customerEmail, customerNumber } = body
    const cartId = getDocId(cart)

    // Process cart items to ensure proper ID format
    const processedCartItems = Array.isArray(cartItems)
      ? cartItems
          .map((item) => ({
            item: typeof item.item === 'string' ? Number(item.item) : item.item,
            quantity: item.quantity,
          }))
          .filter((item) => Number.isFinite(item.item))
      : []

    // Update the cart with the new data from the client
    let updatedCart = cart
    if (cartId) {
      updatedCart = await payload.update({
        collection: 'abandoned-carts',
        id: cartId,
        data: {
          items: processedCartItems,
          customerName,
          customerEmail,
          customerNumber,
          user: user?.id ? user.id : null,
          status: 'active',
          lastActivityAt: new Date().toISOString(),
        },
      })
    }

    // Set the cart session ID cookie
    const response = NextResponse.json(updatedCart)
    const updatedCartSessionId = getSessionIdFromDoc(updatedCart)
    if (!cartSessionId || (updatedCartSessionId && cartSessionId !== updatedCartSessionId)) {
      const sessionId = updatedCartSessionId || generateSessionId()
      response.cookies.set('dyad_cart_sid', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Failed to persist cart:', error)
    return NextResponse.json({ error: 'Failed to persist cart' }, { status: 500 })
  }
}
