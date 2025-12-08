import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import { unstable_cache as unstableCache } from 'next/cache'
import { Suspense } from 'react'
import Link from 'next/link'

import config from '@/payload.config'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { OrderNowButton } from '@/components/order-now-button'
import { SiteHeader } from '@/components/site-header'
import type { Metadata } from 'next'

export const revalidate = 3600

// Add proper metadata for the products page
export async function generateMetadata(): Promise<Metadata> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const serverURL = payload.config.serverURL || 'https://online-bazar.top'

  return {
    title: 'Our Products | Online Bazar',
    description: 'Discover our complete collection of premium items',
    openGraph: {
      title: 'Our Products | Online Bazar',
      description: 'Discover our complete collection of premium items',
      url: `${serverURL}/products`,
      siteName: 'Online Bazar',
      images: [
        {
          url: `${serverURL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Online Bazar Products',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Our Products | Online Bazar',
      description: 'Discover our complete collection of premium items',
      images: [`${serverURL}/og-image.png`],
    },
    other: {
      'fb:app_id': process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    },
  }
}

const getItemsCached = unstableCache(
  async () => {
    try {
      const payloadConfig = await config
      const payload = await getPayload({ config: payloadConfig })

      return await payload.find({
        collection: 'items',
        where: { available: { equals: true } },
        depth: 1,
        limit: 100, // Show all available products
      })
    } catch (error) {
      console.error('Error fetching items for cache:', error)
      // Return empty result set instead of throwing
      return {
        docs: [],
        totalDocs: 0,
        limit: 100,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      }
    }
  },
  ['items:list:all'],
  { revalidate: 300 },
)

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>
type AuthPromise = ReturnType<PayloadInstance['auth']>
type ItemsPromise = ReturnType<typeof getItemsCached>

type HeaderSectionProps = {
  authPromise: AuthPromise
}

type ProductGridSectionProps = {
  authPromise: AuthPromise
  itemsPromise: ItemsPromise
}

export default async function ProductsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const itemsPromise = getItemsCached()
  const authPromise = payload.auth({ headers })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-100 text-gray-800">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.35),_transparent_65%)] motion-reduce:opacity-25"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.3),_transparent_60%)] motion-reduce:opacity-25 animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(147,197,253,0.25),_transparent_60%)] motion-reduce:opacity-20 animation-delay-4000"></div>
      </div>

      <div className="relative z-20">
        <Suspense fallback={<HeaderFallback />}>
          <HeaderSection authPromise={authPromise} />
        </Suspense>
      </div>

      <div className="relative z-10">
        <section className="relative py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="space-y-8 motion-safe:animate-fade-in motion-reduce:fade-in-reset">
              <div className="space-y-4">
                <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter">
                  <span className="brand-text motion-safe:animate-gradient-x motion-reduce:brand-gradient-static">
                    Our Products
                  </span>
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto rounded-full"></div>
                <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-6">
                  Discover our complete collection of premium items
                </p>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<ProductGridFallback />}>
          <ProductGridSection authPromise={authPromise} itemsPromise={itemsPromise} />
        </Suspense>
      </div>
    </div>
  )
}

async function HeaderSection({ authPromise }: HeaderSectionProps) {
  const authResult = await authPromise
  const user = authResult?.user ?? null

  return <SiteHeader variant="full" user={user ?? undefined} />
}

async function ProductGridSection({ authPromise, itemsPromise }: ProductGridSectionProps) {
  const [authResult, items] = await Promise.all([authPromise, itemsPromise])
  const user = authResult?.user ?? null
  const userDeliveryZone =
    (user as any)?.deliveryZone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka'

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Online Bazar Grid */}
      <section className="space-y-12">
        {items.docs.length === 0 ? (
          <div className="text-center py-20">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl">🔄</span>
              </div>
              <p className="text-gray-600 text-xl">New experiences loading...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.docs.map((item: any, index: number) => (
              <Card
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border-2 border-gray-200/60 bg-white shadow-xl transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-300/60 transform-group-0 md:bg-white/95 md:backdrop-blur-xl gap-0 p-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Enhanced Card Glow Effect */}
                <div className="absolute inset-0 hidden md:block md:bg-gradient-to-br md:from-amber-100/30 md:via-rose-100/20 md:to-blue-100/30 md:opacity-0 md:group-hover:opacity-100 md:transition-all md:duration-700"></div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 hidden motion-safe:md:block motion-safe:md:-translate-x-full motion-safe:md:group-hover:translate-x-full motion-safe:md:transition-transform motion-safe:md:duration-1000 md:bg-gradient-to-r md:from-transparent md:via-white/20 md:to-transparent md:skew-x-12"></div>

                <div className="relative z-10 h-full flex flex-col">
                  <Link href={`/item/${item.id}`} className="block">
                    {((item.image && typeof item.image === 'object') || item.imageUrl) && (
                      <div className="relative aspect-[5/4] overflow-hidden rounded-t-3xl">
                        <Image
                          src={
                            item.image && typeof item.image === 'object'
                              ? item.image.url
                              : item.imageUrl
                          }
                          alt={
                            (item.image && typeof item.image === 'object'
                              ? item.image.alt
                              : undefined) || item.name
                          }
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-110"
                        />
                        {/* Image Overlay */}
                        <div className="absolute inset-0 hidden md:block md:bg-gradient-to-t md:from-gray-900/30 md:via-transparent md:to-transparent md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-500"></div>

                        {/* Floating Badge */}
                        <div className="absolute top-4 right-4 transform group-hover:scale-110 transition-transform duration-300">
                          <Badge
                            variant="secondary"
                            className="bg-white text-gray-700 border border-gray-200/60 shadow-lg font-medium px-3 py-1 md:bg-white/90 md:backdrop-blur-sm"
                          >
                            {typeof item.category === 'object'
                              ? (item.category as any)?.name
                              : item.category}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <CardHeader className="space-y-3 p-4">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors duration-300 leading-tight">
                          {item.name}
                        </CardTitle>
                        <div className="h-0.5 w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {item.shortDescription ?? item.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>

                  <CardFooter className="flex items-center justify-between border-t border-gray-200/60 bg-white p-4 rounded-b-3xl md:bg-gradient-to-r md:from-gray-50/80 md:to-white/80 md:backdrop-blur-sm">
                    <div className="space-y-1">
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Tk {item.price.toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500 font-medium">Premium Quality</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1 sm:gap-2 md:flex-col md:items-end md:gap-2 lg:flex-row lg:flex-wrap lg:items-center">
                      <AddToCartButton item={item} />
                      <OrderNowButton
                        item={item}
                        isLoggedIn={!!user}
                        deliveryZone={userDeliveryZone}
                      />
                    </div>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function HeaderFallback() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-none sm:backdrop-blur-2xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-rose-200 animate-pulse" />
          <div className="h-6 w-32 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
    </header>
  )
}

function ProductGridFallback() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-5xl font-bold brand-text">Our Collection</h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handcrafted experiences, delivered to perfection
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="group relative overflow-hidden rounded-3xl border-2 border-gray-200/60 bg-white shadow-xl"
            >
              <div className="flex h-full flex-col">
                <div className="relative aspect-[5/4] overflow-hidden rounded-t-3xl bg-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-12 rounded-full bg-gradient-to-r from-amber-200 to-rose-200 opacity-80" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-5/6 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-gray-200/60 bg-white p-4 rounded-b-3xl">
                  <div className="space-y-2">
                    <div className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-20 rounded-full bg-gray-100 animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
