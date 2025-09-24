import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { OrderNowButton } from '@/components/order-now-button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import ReviewSection from './ReviewSection'
import { DynamicReviewStars, ProductImage } from '@/components/dynamic-product-components'
import { normalizeDeliverySettings, DEFAULT_DELIVERY_SETTINGS } from '@/lib/delivery-settings'
import type { Metadata } from 'next'

export const revalidate = 3600

// Function to get image URL for Open Graph
const getImageUrl = (item: any, serverURL: string): string => {
  // If item has an uploaded image
  if (item.image && typeof item.image === 'object' && item.image.url) {
    // If it's already an absolute URL, return as is
    if (item.image.url.startsWith('http')) {
      return item.image.url
    }
    // Otherwise, prepend server URL
    return `${serverURL || ''}${item.image.url}`
  }

  // If item has an imageUrl field
  if (item.imageUrl) {
    // If it's already an absolute URL, return as is
    if (item.imageUrl.startsWith('http')) {
      return item.imageUrl
    }
    // Otherwise, prepend server URL
    return `${serverURL || ''}${item.imageUrl}`
  }

  // Fallback to default og-image
  return '/og-image.png'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const { id } = resolvedParams

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const item = await payload.findByID({
      collection: 'items',
      id,
      depth: 1,
    })

    if (!item) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      }
    }

    const serverURL = payload.config.serverURL || 'http://localhost:3000'
    const imageUrl = getImageUrl(item, serverURL)

    return {
      title: item.name,
      description: item.shortDescription || item.description,
      openGraph: {
        title: item.name,
        description: item.shortDescription || item.description,
        url: `${serverURL}/item/${id}`,
        siteName: 'Online Bazar',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: item.name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: item.name,
        description: item.shortDescription || item.description,
        images: [imageUrl],
      },
      other: {
        'fb:app_id': process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
      },
    }
  } catch (error) {
    return {
      title: 'Product',
      description: 'View our premium products.',
      other: {
        'fb:app_id': process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
      },
    }
  }
}

async function getItem(id: string, payload: any) {
  const item = await payload.findByID({
    collection: 'items',
    id,
    depth: 2,
  })
  return item
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const deliveryZone =
    (user as any)?.deliveryZone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka'

  const item = await getItem(id, payload)

  const deliverySettingsResult = await payload
    .find({ collection: 'delivery-settings', limit: 1 })
    .catch(() => null)
  const deliverySettings = normalizeDeliverySettings(
    (deliverySettingsResult as any)?.docs?.[0] || DEFAULT_DELIVERY_SETTINGS,
  )

  if (!item) {
    return notFound()
  }

  const shortDescription = (item as any).shortDescription || item.description

  const categoryLabel =
    typeof (item as any).category === 'object'
      ? ((item as any).category as any)?.name
      : (item as any).category

  // Approved reviews for this product
  const reviewsRes = await payload.find({
    collection: 'reviews',
    where: {
      and: [{ item: { equals: id } }, { approved: { equals: true } }],
    },
    depth: 2,
    limit: 50,
    sort: '-createdAt',
  })
  const reviews = reviewsRes?.docs || []
  const ratingAvg = reviews.length
    ? Math.round(
        (reviews.reduce((a: number, r: any) => a + Number(r.rating || 0), 0) / reviews.length) * 10,
      ) / 10
    : 0

  // Check if current user can review (completed order contains this item)
  let canReview = false
  if (user) {
    try {
      const orders = await payload.find({
        collection: 'orders',
        where: {
          and: [
            { user: { equals: (user as any).id } },
            { status: { equals: 'completed' } },
            { 'items.item': { equals: id } },
          ],
        },
        limit: 1,
      })
      canReview = (orders?.docs?.length || 0) > 0
    } catch {}
  }

  const highlightCards = [
    {
      icon: Truck,
      title: deliverySettings.shippingHighlightTitle,
      subtitle: deliverySettings.shippingHighlightSubtitle,
    },
    {
      icon: ShieldCheck,
      title: 'Secure digital payments',
      subtitle: 'Trusted checkout powered by top gateways',
    },
    {
      icon: ShoppingCart,
      title: 'Curated premium picks',
      subtitle: 'Hand-selected items you can rely on',
    },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 text-gray-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <SiteHeader variant="full" user={user} />

      <main className="relative z-10 pt-8 pb-16">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-16 lg:px-8">
          <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-amber-200 transition hover:text-amber-600 hover:ring-amber-300"
            >
              <span aria-hidden>←</span>
              Back to all items
            </Link>
            {categoryLabel ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                {categoryLabel}
              </span>
            ) : null}
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              {((item.image && typeof item.image === 'object') || item.imageUrl) && (
                <div className="group relative overflow-hidden rounded-[2.75rem] border border-white/60 bg-white shadow-xl shadow-amber-100/80">
                  <div className="relative aspect-square">
                    <ProductImage
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
                      className="object-cover transition duration-700 ease-out group-hover:scale-105 group-hover:saturate-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>
                </div>
              )}

              <div className="grid gap-4 rounded-[2rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">
                  Highlights
                </p>
                <p className="text-lg leading-relaxed text-gray-600 whitespace-pre-line">
                  {shortDescription}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                    ⭐ Rated {ratingAvg || '0.0'} / 5
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-rose-700">
                    {reviews.length} verified reviews
                  </span>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-[2.75rem] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-amber-100/70 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      {item.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600"
                    >
                      In store
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <DynamicReviewStars value={ratingAvg} />
                      <span>{reviews.length} Reviews</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-700">
                      {categoryLabel || 'Featured'}
                    </span>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-500">
                        Starting from
                      </p>
                      <p className="text-4xl font-bold text-gray-900 sm:text-5xl">
                        Tk {item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-amber-400 to-rose-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg">
                      Best Deal
                    </span>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <AddToCartButton item={item as any} />
                    <OrderNowButton
                      item={item as any}
                      isLoggedIn={!!user}
                      deliveryZone={deliveryZone}
                    />
                  </div>

                  <div className="mt-6 grid gap-4">
                    {highlightCards.map(({ icon: Icon, title, subtitle }) => (
                      <div
                        key={title}
                        className="flex items-start gap-4 rounded-2xl border border-amber-100/60 bg-amber-50/40 p-4 text-sm text-gray-600 shadow-sm"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-500 shadow-inner">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">{title}</p>
                          <p className="text-xs text-gray-500">{subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6 text-sm text-gray-600 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">
                    Need help?
                  </p>
                  <p className="mt-2 leading-relaxed">
                    Chat with our concierge team for personalised recommendations, delivery
                    schedules, or bulk order support. We are online 9am – 11pm daily.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-16 rounded-[2.75rem] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="inline-flex rounded-full bg-amber-100/60 p-1 text-sm">
                <TabsTrigger
                  value="description"
                  className="rounded-full px-6 py-2 font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-full px-6 py-2 font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="description"
                className="mt-8 text-lg leading-relaxed text-gray-600"
              >
                <div className="prose max-w-none whitespace-pre-line">{item.description}</div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-8">
                <ReviewSection
                  itemId={id}
                  canReview={!!canReview}
                  userId={(user as any)?.id || null}
                  initialReviews={reviews as any}
                />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  )
}
