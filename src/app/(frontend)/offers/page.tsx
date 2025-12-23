import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiZap,
  FiTag,
  FiGift,
  FiPackage,
  FiTruck,
  FiClock,
  FiArrowRight,
  FiPercent,
} from 'react-icons/fi'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Offers & Deals | Online Bazar',
  description:
    'Check out our latest offers, flash sales, and exclusive deals. Save big on your favorite products!',
}

interface Offer {
  id: string
  name: string
  type: 'flash_sale' | 'category_sale' | 'buy_x_get_y' | 'bundle' | 'free_shipping' | 'promo_banner'
  description?: string
  discountType?: 'percent' | 'fixed' | 'free_item'
  discountValue?: number
  startDate: string
  endDate: string
  isActive: boolean
  displayOnHomepage: boolean
  badge?: string
  highlightColor: string
  bannerImage?: { url: string }
  bannerLink?: string
  bannerText?: string
  targetProducts?: { id: string; name: string; price: number; image?: { url: string } }[]
  targetCategory?: { id: string; name: string }
}

const offerTypeConfig = {
  flash_sale: { icon: FiZap, label: 'Flash Sale', color: 'bg-red-500', bgColor: 'bg-red-50' },
  category_sale: {
    icon: FiTag,
    label: 'Category Sale',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
  },
  buy_x_get_y: {
    icon: FiGift,
    label: 'Buy X Get Y',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
  },
  bundle: { icon: FiPackage, label: 'Bundle Deal', color: 'bg-green-500', bgColor: 'bg-green-50' },
  free_shipping: {
    icon: FiTruck,
    label: 'Free Shipping',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
  },
  promo_banner: {
    icon: FiPercent,
    label: 'Promotion',
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
  },
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const end = new Date(endDate).getTime()
  const now = Date.now()
  const diff = end - now

  if (diff <= 0) return <span className="text-red-500">Ended</span>

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="flex items-center gap-1 text-amber-600 font-medium">
      <FiClock className="w-4 h-4" />
      {days > 0 && <span>{days}d</span>}
      <span>{hours}h</span>
      <span>{minutes}m left</span>
    </div>
  )
}

export default async function OffersPage() {
  const payload = await getPayload({ config })

  const now = new Date().toISOString()

  // Try to fetch offers - may fail if table doesn't exist yet
  let offers: any[] = []
  try {
    const result = await payload.find({
      collection: 'offers',
      where: {
        and: [
          { isActive: { equals: true } },
          { startDate: { less_than_equal: now } },
          { endDate: { greater_than: now } },
        ],
      },
      sort: '-priority',
      limit: 50,
      depth: 2,
    })
    offers = result.docs || []
  } catch (error) {
    // Table may not exist yet during first build
    console.error('Failed to fetch offers:', error)
    offers = []
  }

  // Group offers by type
  const flashSales = offers.filter((o: any) => o.type === 'flash_sale')
  const categorySales = offers.filter((o: any) => o.type === 'category_sale')
  const bogoDeals = offers.filter((o: any) => o.type === 'buy_x_get_y')
  const bundles = offers.filter((o: any) => o.type === 'bundle')
  const freeShipping = offers.filter((o: any) => o.type === 'free_shipping')
  const banners = offers.filter((o: any) => o.type === 'promo_banner')

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" />

      <div className="container mx-auto px-4 pt-20 pb-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-2xl p-8 md:p-12 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🎉 Hot Deals & Offers</h1>
            <p className="text-white/90 text-lg mb-4">
              Discover amazing discounts on your favorite products
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-0 text-sm">⚡ Flash Sales</Badge>
              <Badge className="bg-white/20 text-white border-0 text-sm">🎁 BOGO Deals</Badge>
              <Badge className="bg-white/20 text-white border-0 text-sm">📦 Bundle Savings</Badge>
            </div>
          </div>
        </div>

        {/* Promo Banners */}
        {banners.length > 0 && (
          <div className="grid gap-4 mb-8">
            {banners.map((banner: any) => (
              <Link
                key={banner.id}
                href={banner.bannerLink || '/products'}
                className="block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {banner.bannerImage?.url ? (
                  <div className="relative h-32 md:h-48">
                    <Image
                      src={banner.bannerImage.url}
                      alt={banner.name}
                      fill
                      className="object-cover"
                    />
                    {banner.bannerText && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <p className="text-white text-xl md:text-3xl font-bold text-center px-4">
                          {banner.bannerText}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-32 md:h-48 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                    <p className="text-white text-xl md:text-3xl font-bold text-center px-4">
                      {banner.name}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Flash Sales */}
        {flashSales.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500 rounded-lg text-white">
                <FiZap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">⚡ Flash Sales</h2>
                <p className="text-sm text-gray-500">
                  Limited time offers - grab them before they&apos;re gone!
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {flashSales.map((offer: any) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* BOGO Deals */}
        {bogoDeals.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg text-white">
                <FiGift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">🎁 Buy & Get Free</h2>
                <p className="text-sm text-gray-500">Buy more, save more with our BOGO deals</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bogoDeals.map((offer: any) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* Category Sales */}
        {categorySales.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <FiTag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">🏷️ Category Sales</h2>
                <p className="text-sm text-gray-500">Entire categories on discount!</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categorySales.map((offer: any) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* Bundle Deals */}
        {bundles.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <FiPackage className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">📦 Bundle Deals</h2>
                <p className="text-sm text-gray-500">Buy together and save big!</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((offer: any) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* Free Shipping */}
        {freeShipping.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500 rounded-lg text-white">
                <FiTruck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">🚚 Free Shipping</h2>
                <p className="text-sm text-gray-500">No delivery charges on these items</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {freeShipping.map((offer: any) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* No offers */}
        {offers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGift className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Active Offers</h2>
            <p className="text-gray-500 mb-6">Check back soon for amazing deals!</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function OfferCard({ offer }: { offer: Offer }) {
  const typeConfig = offerTypeConfig[offer.type]
  const TypeIcon = typeConfig.icon

  return (
    <div
      className={`rounded-xl p-5 ${typeConfig.bgColor} border border-gray-100 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${typeConfig.color} text-white`}>
            <TypeIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-gray-600">{typeConfig.label}</span>
        </div>
        {offer.badge && (
          <Badge className="bg-red-500 text-white text-xs border-0">{offer.badge}</Badge>
        )}
      </div>

      <h3 className="font-bold text-gray-800 mb-1">{offer.name}</h3>
      {offer.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
      )}

      {/* Discount Display */}
      {offer.type === 'free_shipping' ? (
        <div className="mb-3">
          <span className="text-2xl font-bold text-green-600">FREE SHIPPING</span>
          {(offer as any).minOrderValue > 0 && (
            <p className="text-sm text-gray-600">On orders above ৳{(offer as any).minOrderValue}</p>
          )}
        </div>
      ) : offer.discountValue && offer.discountType ? (
        <div className="mb-3">
          {offer.discountType === 'percent' && (
            <span className="text-2xl font-bold text-green-600">{offer.discountValue}% OFF</span>
          )}
          {offer.discountType === 'fixed' && (
            <span className="text-2xl font-bold text-green-600">৳{offer.discountValue} OFF</span>
          )}
        </div>
      ) : null}

      {/* Countdown */}
      <div className="flex items-center justify-between">
        <CountdownTimer endDate={offer.endDate} />
        <Link
          href="/products"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
        >
          Shop Now <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
