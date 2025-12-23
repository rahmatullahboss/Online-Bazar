import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface CartItemInput {
  id: string
  quantity: number
}

interface ValidatedCartItem {
  id: string
  name: string
  price: number // Current discounted price
  originalPrice?: number // Original price before discount (if offer applies)
  quantity: number
  category: string
  image?: {
    url: string
    alt?: string
  }
  hasOffer: boolean
  offerBadge?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items: CartItemInput[] = body.items || []

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const payload = await getPayload({ config })
    const now = new Date().toISOString()

    // Fetch current active offers
    let offers: any[] = []
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
      offers = offersResult.docs || []
    } catch (e) {
      console.error('Failed to fetch offers:', e)
    }

    // Fetch product details for all cart items
    const itemIds = items.map((item) => item.id)
    const productsResult = await payload.find({
      collection: 'items',
      where: {
        id: { in: itemIds },
      },
      depth: 1,
      limit: 100,
    })

    const productsMap = new Map<string, any>()
    for (const product of productsResult.docs) {
      productsMap.set(String(product.id), product)
    }

    // Helper function to get offers for a product
    const getOffersForProduct = (productId: string, categoryId?: string) => {
      // Filter offers that apply to this product
      const applicableOffers = offers.filter((offer) => {
        if (offer.targetType === 'all') return true
        if (offer.targetType === 'specific_products') {
          const targetIds = (offer.targetProducts || []).map((p: any) =>
            typeof p === 'object' ? String(p.id) : String(p),
          )
          return targetIds.includes(productId)
        }
        if (offer.targetType === 'category' && categoryId) {
          const targetCatId =
            typeof offer.targetCategory === 'object'
              ? offer.targetCategory?.id
              : offer.targetCategory
          return String(targetCatId) === String(categoryId)
        }
        return false
      })

      if (applicableOffers.length === 0) return null

      // Priority: specific_products > category > all
      const specificOffer = applicableOffers.find((o) => o.targetType === 'specific_products')
      if (specificOffer) return specificOffer

      const categoryOffer = applicableOffers.find((o) => o.targetType === 'category')
      if (categoryOffer) return categoryOffer

      return applicableOffers[0]
    }

    // Calculate discounted price
    const calculateDiscount = (offer: any, originalPrice: number) => {
      if (!offer || !offer.discountType) {
        return { discountedPrice: originalPrice, savings: 0 }
      }

      let discountedPrice = originalPrice
      if (offer.discountType === 'percent' && offer.discountValue) {
        discountedPrice = originalPrice * (1 - offer.discountValue / 100)
      } else if (offer.discountType === 'fixed' && offer.discountValue) {
        discountedPrice = Math.max(0, originalPrice - offer.discountValue)
      }

      return {
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        savings: originalPrice - discountedPrice,
      }
    }

    // Validate and update each cart item
    const validatedItems: ValidatedCartItem[] = []

    for (const cartItem of items) {
      const product = productsMap.get(String(cartItem.id))

      if (!product) {
        // Product not found - skip it (will be removed from cart)
        continue
      }

      const categoryId =
        typeof product.category === 'object' ? product.category?.id : product.category
      const categoryName =
        typeof product.category === 'object' ? product.category?.name : product.category || ''

      const offer = getOffersForProduct(String(product.id), categoryId)
      const originalPrice = product.price
      const { discountedPrice } = offer
        ? calculateDiscount(offer, originalPrice)
        : { discountedPrice: originalPrice }

      const hasOffer = offer && discountedPrice < originalPrice

      // Extract image properly - can be an object with url or just a string
      let imageData: { url: string; alt?: string } | undefined
      if (product.image) {
        if (typeof product.image === 'object' && product.image.url) {
          imageData = {
            url: product.image.url,
            alt: product.image.alt || product.name,
          }
        } else if (typeof product.image === 'string') {
          imageData = { url: product.image }
        }
      }

      validatedItems.push({
        id: String(product.id),
        name: product.name,
        price: discountedPrice,
        originalPrice: hasOffer ? originalPrice : undefined,
        quantity: cartItem.quantity,
        category: categoryName,
        image: imageData,
        hasOffer: !!hasOffer,
        offerBadge: hasOffer ? offer?.badge : undefined,
      })
    }

    return NextResponse.json({ items: validatedItems })
  } catch (error) {
    console.error('Error validating cart prices:', error)
    return NextResponse.json({ error: 'Failed to validate prices' }, { status: 500 })
  }
}
