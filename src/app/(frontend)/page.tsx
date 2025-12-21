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
import { SITE_NAME } from '@/lib/site-config'

export const revalidate = 3600

const getItemsCached = unstableCache(
  async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const payloadConfig = await config
        const payload = await getPayload({ config: payloadConfig })

        return await payload.find({
          collection: 'items',
          where: { available: { equals: true } },
          depth: 1,
          limit: 12,
        })
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed fetching items:`, error)
        if (attempt < 4) {
          // Exponential backoff: 500ms, 1s, 1.5s, 2s
          const delay = Math.min(500 * Math.pow(2, attempt), 2000)
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          // Final attempt failed, return empty to avoid page crash
          return {
            docs: [],
            totalDocs: 0,
            limit: 12,
            totalPages: 1,
            page: 1,
            pagingCounter: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
          }
        }
      }
    }
  },
  ['items:list:v1'],
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

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const itemsPromise = getItemsCached()
  const authPromise = payload.auth({ headers })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-100 text-gray-800">
      {/* Animated Background Elements - hidden on mobile for better LCP */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
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
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Floating Elements - hidden on mobile for better LCP */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <div className="absolute top-20 left-10 w-4 h-4 bg-amber-300 rounded-full opacity-60 motion-safe:animate-bounce motion-reduce:animate-none motion-reduce:translate-y-0 animation-delay-1000"></div>
            <div className="absolute top-40 right-20 w-6 h-6 bg-rose-300 rounded-full opacity-50 motion-safe:animate-bounce motion-reduce:animate-none motion-reduce:translate-y-0 animation-delay-2000"></div>
            <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-300 rounded-full opacity-60 motion-safe:animate-bounce motion-reduce:animate-none motion-reduce:translate-y-0 animation-delay-3000"></div>
            <div className="absolute bottom-20 right-10 w-5 h-5 bg-amber-200 rounded-full opacity-40 motion-safe:animate-bounce motion-reduce:animate-none motion-reduce:translate-y-0 animation-delay-4000"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            {/* Removed animate-fade-in to improve LCP - the paragraph is the LCP element */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter">
                  <span className="brand-text motion-safe:animate-gradient-x motion-reduce:brand-gradient-static">
                    {SITE_NAME}
                  </span>
                  <br />
                  <span className="text-gray-800">Reimagined</span>
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto rounded-full"></div>
              </div>
              {/* LCP Element - no animation to ensure immediate render */}
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Experience the future of shopping with our curated collection of premium items,
                delivered with precision and passion.
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 motion-safe:animate-bounce motion-reduce:animate-none motion-reduce:translate-y-0">
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 motion-safe:animate-pulse motion-reduce:animate-none"></div>
            </div>
          </div>
        </section>

        <Suspense fallback={<ProductGridFallback />}>
          <ProductGridSection authPromise={authPromise} itemsPromise={itemsPromise} />
        </Suspense>
      </div>

      {/* Global footer is rendered via layout */}
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
    <div className="container mx-auto px-2 py-8 sm:px-6 sm:py-16 lg:px-8">
      {/* Online Bazar Grid */}
      <section className="space-y-6 sm:space-y-12">
        <div className="text-center space-y-2 sm:space-y-4">
          <h3 className="text-3xl sm:text-5xl font-bold brand-text">Our Collection</h3>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Handcrafted experiences, delivered to perfection
          </p>
        </div>

        {items!.docs.length === 0 ? (
          <div className="text-center py-20">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl">🔄</span>
              </div>
              <p className="text-gray-600 text-xl">New experiences loading...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items!.docs.map((item: any, index: number) => (
              <Card
                key={item.id}
                className="group relative overflow-hidden rounded-xl sm:rounded-3xl border border-gray-200/60 sm:border-2 bg-white shadow-md sm:shadow-xl transition-all duration-300 sm:duration-700 ease-out hover:shadow-lg sm:hover:scale-[1.02] sm:hover:shadow-2xl sm:hover:shadow-amber-500/20 sm:hover:border-amber-300/60 gap-0 p-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <Link href={`/item/${item.id}`} className="block">
                    {((item.image && typeof item.image === 'object') || item.imageUrl) && (
                      <div className="relative aspect-square sm:aspect-[5/4] overflow-hidden rounded-t-xl sm:rounded-t-3xl">
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
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-all duration-300 sm:duration-700 ease-out group-hover:scale-105 sm:group-hover:scale-110"
                          priority={index < 2}
                        />

                        {/* Floating Badge */}
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                          <Badge
                            variant="secondary"
                            className="bg-white/90 text-gray-700 border border-gray-200/60 shadow text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-3 sm:py-1"
                          >
                            {typeof item.category === 'object'
                              ? (item.category as any)?.name
                              : item.category}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <CardHeader className="p-1.5 sm:p-3 space-y-0.5 sm:space-y-2">
                      <CardTitle className="text-sm sm:text-lg font-semibold sm:font-bold text-gray-800 leading-tight line-clamp-2">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="hidden sm:block text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {item.shortDescription ?? item.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>

                  <CardFooter className="flex items-center justify-between gap-2 border-t border-gray-100 bg-white p-3 sm:p-4 rounded-b-xl sm:rounded-b-3xl mt-auto">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      ৳{item.price.toLocaleString()}
                    </span>
                    <div className="flex gap-1.5 sm:gap-2">
                      <AddToCartButton
                        item={item}
                        compact
                        className="!px-2.5 !py-1.5 !rounded-full !border-2 !border-amber-500 !bg-amber-50 hover:!bg-amber-500 !text-amber-600 hover:!text-white transition-all !font-medium !text-xs sm:!text-sm"
                      />
                      <OrderNowButton
                        item={item}
                        isLoggedIn={!!user}
                        deliveryZone={userDeliveryZone}
                        compact
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
