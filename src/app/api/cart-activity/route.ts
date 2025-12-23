import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

type IncomingItem = { id: string | number; quantity: number }

// Helper to calculate discounted price based on offer
function calculateDiscountedPrice(
  offer: { discountType?: string; discountValue?: number } | null,
  originalPrice: number,
): number {
  if (!offer || !offer.discountType || !offer.discountValue) {
    return originalPrice
  }

  if (offer.discountType === 'percent') {
    return originalPrice * (1 - offer.discountValue / 100)
  } else if (offer.discountType === 'fixed') {
    return Math.max(0, originalPrice - offer.discountValue)
  }

  return originalPrice
}

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers: request.headers })

    const body = await request.json().catch(() => ({}))
    const normalizeString = (value: unknown) => {
      if (typeof value !== 'string') return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }

    const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : []
    // Ignore client-sent total for security - we calculate server-side
    const customerEmail = normalizeString(body?.customerEmail)
    const customerName = normalizeString(body?.customerName)
    const customerNumber = normalizeString(body?.customerNumber)
    const isFinalUpdate = Boolean(body?.isFinalUpdate)
    const isPotentialAbandonment = Boolean(body?.isPotentialAbandonment)

    // Require items
    if (!items.length) {
      return NextResponse.json({ error: 'No cart data' }, { status: 400 })
    }

    // Get or create a lightweight session id cookie
    let sid = request.cookies.get('dyad_cart_sid')?.value
    const isNewSID = !sid
    if (!sid) {
      try {
        sid = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
      } catch {
        sid = Math.random().toString(36).slice(2)
      }
    }

    // Sanitize cart items: ensure numeric relationship IDs for Payload
    const sanitizedItems = items
      .filter(
        (it) =>
          (typeof it?.id === 'string' || typeof it?.id === 'number') && Number(it.quantity) > 0,
      )
      .map((it) => {
        let idNum: number | undefined
        if (typeof it.id === 'number' && Number.isFinite(it.id)) {
          idNum = it.id
        } else {
          const s = String(it.id).trim()
          if (/^\d+$/.test(s)) idNum = Number(s)
        }
        return idNum ? { item: idNum, quantity: Number(it.quantity) } : null
      })
      .filter((row): row is { item: number; quantity: number } => !!row)

    if (sanitizedItems.length === 0) {
      // No valid items, check if we need to delete existing cart
      const existing = await payload.find({
        collection: 'abandoned-carts',
        limit: 1,
        where: {
          and: [{ sessionId: { equals: String(sid) } }, { status: { not_equals: 'recovered' } }],
        },
      })
      if (existing?.docs?.[0]) {
        await payload.delete({
          collection: 'abandoned-carts',
          id: (existing.docs[0] as { id: number }).id,
        })
      }
      return NextResponse.json({ success: true })
    }

    // SERVER-SIDE PRICE CALCULATION - fetch products and offers, calculate total
    const now = new Date().toISOString()
    const itemIds = sanitizedItems.map((it) => it.item)

    // Fetch products
    const productsResult = await payload.find({
      collection: 'items',
      where: { id: { in: itemIds } },
      depth: 1,
      limit: 100,
    })

    const productsMap = new Map<number, { price: number; categoryId?: number }>()
    for (const product of productsResult.docs) {
      const categoryId =
        typeof product.category === 'object'
          ? (product.category as { id: number })?.id
          : typeof product.category === 'number'
            ? product.category
            : undefined
      productsMap.set(product.id, {
        price: product.price,
        categoryId,
      })
    }

    // Fetch active offers
    let offers: Array<{
      targetType?: string
      targetProducts?: Array<{ id: number } | number>
      targetCategory?: { id: number } | number
      discountType?: string
      discountValue?: number
      priority?: number
    }> = []
    try {
      const offersResult = await payload.find({
        collection: 'offers',
        where: {
          and: [
            { isActive: { equals: true } },
            { startDate: { less_than_equal: now } },
            { endDate: { greater_than: now } },
            { type: { not_equals: 'promo_banner' } },
            { type: { not_equals: 'free_shipping' } },
          ],
        },
        sort: '-priority',
        limit: 100,
        depth: 1,
      })
      offers = offersResult.docs as typeof offers
    } catch {
      // Continue without offers
    }

    // Helper to find applicable offer for a product
    const getOfferForProduct = (productId: number, categoryId?: number) => {
      const applicable = offers.filter((offer) => {
        if (offer.targetType === 'all') return true
        if (offer.targetType === 'specific_products') {
          const targetIds = (offer.targetProducts || []).map((p) =>
            typeof p === 'object' ? p.id : p,
          )
          return targetIds.includes(productId)
        }
        if (offer.targetType === 'category' && categoryId) {
          const targetCatId =
            typeof offer.targetCategory === 'object'
              ? offer.targetCategory.id
              : offer.targetCategory
          return targetCatId === categoryId
        }
        return false
      })

      if (applicable.length === 0) return null

      // Priority: specific > category > all
      return (
        applicable.find((o) => o.targetType === 'specific_products') ||
        applicable.find((o) => o.targetType === 'category') ||
        applicable[0]
      )
    }

    // Calculate total with discounted prices
    let calculatedTotal = 0
    for (const item of sanitizedItems) {
      const product = productsMap.get(item.item)
      if (product) {
        const offer = getOfferForProduct(item.item, product.categoryId)
        const discountedPrice = calculateDiscountedPrice(offer, product.price)
        calculatedTotal += discountedPrice * item.quantity
      }
    }

    // Upsert by sessionId (ignore recovered carts)
    const existing = await payload.find({
      collection: 'abandoned-carts',
      limit: 1,
      where: {
        and: [{ sessionId: { equals: String(sid) } }, { status: { not_equals: 'recovered' } }],
      },
    })

    // Pull profile fallbacks for logged-in users
    const userEmail = normalizeString(user ? (user as { email?: string })?.email : undefined)
    const userName = normalizeString(
      user
        ? `${String((user as { firstName?: string })?.firstName || '')} ${String((user as { lastName?: string })?.lastName || '')}`
        : undefined,
    )
    const userNumber = normalizeString(
      user ? (user as { customerNumber?: string })?.customerNumber : undefined,
    )

    const hasContactInfo = Boolean(
      user || customerEmail || customerNumber || userEmail || userNumber,
    )

    if (!hasContactInfo) {
      // No contact info, delete cart if exists
      if (existing?.docs?.[0]) {
        await payload.delete({
          collection: 'abandoned-carts',
          id: (existing.docs[0] as { id: number }).id,
        })
      }
      return NextResponse.json({ success: true })
    }

    const data: Record<string, unknown> = {
      sessionId: String(sid),
      ...(user ? { user: (user as { id: number }).id } : {}),
      ...(customerEmail || userEmail ? { customerEmail: customerEmail || userEmail } : {}),
      ...(customerName || userName ? { customerName: customerName || userName } : {}),
      ...(customerNumber || userNumber ? { customerNumber: customerNumber || userNumber } : {}),
      ...(sanitizedItems.length ? { items: sanitizedItems } : {}),
      // Use server-calculated total (secure)
      cartTotal: Math.round(calculatedTotal * 100) / 100,
      status: isFinalUpdate || isPotentialAbandonment ? 'abandoned' : 'active',
      lastActivityAt: now,
      reminderStage: 0,
    }

    if (isFinalUpdate || isPotentialAbandonment) {
      const note = isFinalUpdate
        ? 'Final update sent when user left the site'
        : 'Potential abandonment detected'
      data.notes = data.notes ? `${data.notes}\n${note}` : note
    }

    let doc
    if (existing?.docs?.[0]) {
      doc = await payload.update({
        collection: 'abandoned-carts',
        id: (existing.docs[0] as { id: number }).id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc = await payload.create({ collection: 'abandoned-carts', data: data as any })
    }

    const res = NextResponse.json({ success: true, id: (doc as { id?: number })?.id })
    if (isNewSID && sid) {
      res.cookies.set('dyad_cart_sid', String(sid), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    return res
  } catch (e) {
    console.error('Cart activity error:', e)
    return NextResponse.json({ error: 'Failed to record cart activity' }, { status: 500 })
  }
}
