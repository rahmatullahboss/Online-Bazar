import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

export interface ActiveOffer {
  id: string
  name: string
  type: string
  badge?: string
  discountType?: 'percent' | 'fixed' | 'free_item'
  discountValue?: number
  highlightColor: string
  endDate: string
}

// Cache active offers for 5 minutes
export const getActiveOffers = unstable_cache(
  async (): Promise<ActiveOffer[]> => {
    try {
      const payload = await getPayload({ config })
      const now = new Date().toISOString()

      const { docs } = await payload.find({
        collection: 'offers',
        where: {
          and: [
            { isActive: { equals: true } },
            { startDate: { less_than_equal: now } },
            { endDate: { greater_than: now } },
            { type: { not_equals: 'promo_banner' } }, // Exclude banners
          ],
        },
        sort: '-priority',
        limit: 100,
        depth: 1,
      })

      return docs.map((offer: any) => ({
        id: offer.id,
        name: offer.name,
        type: offer.type,
        badge: offer.badge,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        highlightColor: offer.highlightColor,
        endDate: offer.endDate,
        targetType: offer.targetType,
        targetProducts:
          offer.targetProducts?.map((p: any) => (typeof p === 'object' ? p.id : p)) || [],
        targetCategory:
          typeof offer.targetCategory === 'object'
            ? offer.targetCategory?.id
            : offer.targetCategory,
      }))
    } catch (error) {
      // Table may not exist yet
      console.error('Failed to fetch offers:', error)
      return []
    }
  },
  ['active-offers'],
  { revalidate: 300 }, // 5 minutes
)

// Get active offers that apply to a specific product
// Priority order: specific_products > category > all (within each group, higher priority wins)
export function getOffersForProduct(
  offers: any[],
  productId: string,
  categoryId?: string,
): ActiveOffer | null {
  let specificProductOffer: ActiveOffer | null = null
  let categoryOffer: ActiveOffer | null = null
  let allProductsOffer: ActiveOffer | null = null

  // Offers are already sorted by priority descending from the query
  // So the first match in each category is the highest priority for that category
  for (const offer of offers) {
    // Check if offer targets this specific product (highest priority)
    if (
      offer.targetType === 'specific_products' &&
      offer.targetProducts?.includes(productId) &&
      !specificProductOffer
    ) {
      specificProductOffer = offer
    }

    // Check if offer targets this category (second priority)
    if (
      offer.targetType === 'category' &&
      categoryId &&
      offer.targetCategory === categoryId &&
      !categoryOffer
    ) {
      categoryOffer = offer
    }

    // Check if offer targets all products (lowest priority)
    if (offer.targetType === 'all' && !allProductsOffer) {
      allProductsOffer = offer
    }
  }

  // Return in priority order: specific product > category > all
  return specificProductOffer || categoryOffer || allProductsOffer
}

// Calculate discount for a product based on an offer
export function calculateOfferDiscount(
  offer: ActiveOffer,
  price: number,
): { discountedPrice: number; savings: number } {
  if (!offer.discountType || !offer.discountValue) {
    return { discountedPrice: price, savings: 0 }
  }

  let savings = 0

  if (offer.discountType === 'percent') {
    savings = (price * offer.discountValue) / 100
  } else if (offer.discountType === 'fixed') {
    savings = Math.min(offer.discountValue, price)
  }

  return {
    discountedPrice: Math.max(0, price - savings),
    savings,
  }
}

// Get banner color classes based on highlight color
export function getOfferColorClasses(color: string): {
  bg: string
  text: string
  border: string
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
    orange: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' },
    yellow: { bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-400' },
    green: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
    blue: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
    purple: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500' },
  }

  return colors[color] || colors.red
}
