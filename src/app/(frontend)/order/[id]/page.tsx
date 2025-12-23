import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import OrderForm from './order-form'
import { normalizeDeliverySettings, DEFAULT_DELIVERY_SETTINGS } from '@/lib/delivery-settings'
import { getActiveOffers, getOffersForProduct, calculateOfferDiscount } from '@/lib/offer-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const fullUser = user
    ? await payload.findByID({ collection: 'users', id: (user as any).id }).catch(() => null)
    : null

  const item = await payload.findByID({
    collection: 'items',
    id,
    depth: 2,
  })

  const deliverySettingsResult = await payload
    .find({ collection: 'delivery-settings', limit: 1 })
    .catch(() => null)
  const deliverySettings = normalizeDeliverySettings(
    (deliverySettingsResult as any)?.docs?.[0] || DEFAULT_DELIVERY_SETTINGS,
  )

  // Fetch offers and calculate discounted price
  const offers = await getActiveOffers()
  const categoryId =
    typeof item?.category === 'object' ? (item.category as any)?.id : item?.category
  const productOffer = item ? getOffersForProduct(offers, id, categoryId) : null
  const originalPrice = item?.price || 0
  const { discountedPrice } = productOffer
    ? calculateOfferDiscount(productOffer, originalPrice)
    : { discountedPrice: originalPrice }

  // Create item with discounted price for OrderForm
  const itemWithDiscount = item
    ? {
        ...item,
        price: discountedPrice,
        originalPrice: productOffer ? originalPrice : undefined,
      }
    : null

  const steps = [
    { label: 'Product', status: 'done' as const },
    { label: 'Checkout', status: 'current' as const },
  ]

  if (!itemWithDiscount || !item?.available) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(251,191,36,0.14),transparent)]" />
        <SiteHeader variant="full" user={(fullUser as any) || (user as any)} />
        <div className="relative mx-auto w-full max-w-4xl px-4 pb-16 pt-20 sm:pt-24">
          <Card className="rounded-3xl border border-amber-100/80 bg-white/90 shadow-xl shadow-amber-200/60 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold text-stone-900">
                Item not available
              </CardTitle>
              <CardDescription className="text-base text-stone-500">
                Sorry, this item is not available for ordering right now. Please explore other
                products.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button
                asChild
                className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-6 font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-600 hover:to-rose-600"
              >
                <Link href="/">Back to shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(251,191,36,0.14),transparent)]" />
      <SiteHeader variant="full" user={(fullUser as any) || (user as any)} />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-10 lg:px-8 lg:pt-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button
            asChild
            variant="ghost"
            className="h-11 rounded-full border border-transparent bg-white/80 px-4 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur transition hover:border-amber-200 hover:bg-white hover:text-amber-600"
          >
            <Link href="/">← Back to shopping</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-stone-500">
            {steps.map((step, index) => (
              <React.Fragment key={step.label}>
                <span
                  className={
                    step.status === 'current'
                      ? 'flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600'
                      : 'flex items-center gap-2 text-stone-500'
                  }
                >
                  <span
                    className={
                      step.status === 'done'
                        ? 'flex size-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-xs font-semibold text-white shadow'
                        : 'flex size-6 items-center justify-center rounded-full border border-amber-200 bg-white text-xs font-semibold text-amber-600 shadow-sm'
                    }
                    aria-hidden
                  >
                    {step.status === 'done' ? <Check className="h-3 w-3" /> : index + 1}
                  </span>
                  {step.label}
                </span>
                {index < steps.length - 1 ? (
                  <span className="hidden h-px w-8 bg-stone-300 sm:block" aria-hidden />
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>

        <OrderForm
          item={itemWithDiscount}
          user={(fullUser as any) || (user as any)}
          deliverySettings={deliverySettings}
        />
      </div>
    </div>
  )
}
