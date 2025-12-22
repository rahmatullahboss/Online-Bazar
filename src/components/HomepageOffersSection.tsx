import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { FiArrowRight, FiZap, FiGift, FiClock } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

async function getHomepageOffers() {
  try {
    const payload = await getPayload({ config })
    const now = new Date().toISOString()

    const { docs } = await payload.find({
      collection: 'offers',
      where: {
        and: [
          { isActive: { equals: true } },
          { displayOnHomepage: { equals: true } },
          { startDate: { less_than_equal: now } },
          { endDate: { greater_than: now } },
          { type: { not_equals: 'promo_banner' } },
        ],
      },
      sort: '-priority',
      limit: 4,
      depth: 1,
    })

    return docs
  } catch (error) {
    console.error('Failed to fetch homepage offers:', error)
    return []
  }
}

function getTimeRemaining(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h left`
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m left`
}

const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', iconBg: 'bg-yellow-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-500' },
}

export async function HomepageOffersSection() {
  const offers = await getHomepageOffers()

  if (offers.length === 0) return null

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 rounded-xl text-white">
              <FiZap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">🔥 Hot Deals</h2>
              <p className="text-sm text-gray-500 hidden sm:block">Limited time offers</p>
            </div>
          </div>
          <Link href="/offers">
            <Button variant="outline" size="sm" className="gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offers.map((offer: any) => {
            const colors = colorClasses[offer.highlightColor] || colorClasses.red

            return (
              <Link
                key={offer.id}
                href="/offers"
                className={`${colors.bg} rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colors.iconBg} text-white`}>
                    {offer.type === 'flash_sale' && <FiZap className="w-4 h-4" />}
                    {offer.type === 'buy_x_get_y' && <FiGift className="w-4 h-4" />}
                    {!['flash_sale', 'buy_x_get_y'].includes(offer.type) && (
                      <FiZap className="w-4 h-4" />
                    )}
                  </div>
                  {offer.badge && (
                    <Badge className={`${colors.iconBg} text-white text-xs border-0`}>
                      {offer.badge}
                    </Badge>
                  )}
                </div>

                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{offer.name}</h3>

                {offer.discountValue && offer.discountType && (
                  <p className={`text-lg font-bold ${colors.text} mb-2`}>
                    {offer.discountType === 'percent' && `${offer.discountValue}% OFF`}
                    {offer.discountType === 'fixed' && `৳${offer.discountValue} OFF`}
                  </p>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiClock className="w-3 h-3" />
                  <span>{getTimeRemaining(offer.endDate)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
