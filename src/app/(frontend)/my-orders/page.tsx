import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import config from '@/payload.config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { CancelOrderButton } from './CancelOrderButton'

export const dynamic = 'force-dynamic'

const formatPaymentMethod = (method?: string | null) => {
  switch (method) {
    case 'bkash':
      return 'bKash'
    case 'nagad':
      return 'Nagad'
    case 'cod':
      return 'Cash on Delivery'
    default:
      return 'Cash on Delivery'
  }
}

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const sp = await searchParams
  const { success } = sp
  const orderId = (sp as any)?.orderId as string | undefined
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user's orders
  const orders = await payload.find({
    collection: 'orders',
    where: {
      user: {
        equals: user.id,
      },
    },
    depth: 3,
    sort: '-orderDate',
  })
  const confirmedOrder =
    success && orders.docs.length > 0
      ? orders.docs.find((o: any) => String(o.id) === String(orderId)) || orders.docs[0]
      : null

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">← Back to Home</Link>
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {success && (
          <Alert className="mb-6">
            <AlertDescription>Order placed successfully! 🎉</AlertDescription>
          </Alert>
        )}

        {/* Order confirmation preview */}
        {success && confirmedOrder && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border p-3 bg-white">
            {(() => {
              const s = confirmedOrder.items?.[0]?.item
              if (s && typeof s === 'object') {
                const imgUrl = (s as any)?.image?.url || (s as any)?.imageUrl
                if (imgUrl) {
                  return (
                    <div className="relative w-12 h-12 rounded overflow-hidden border">
                      <Image
                        src={imgUrl}
                        alt={(s as any)?.image?.alt || (s as any)?.name || 'Ordered item'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )
                }
              }
              return null
            })()}
            <div className="text-sm text-gray-700">
              <span className="font-medium">
                {typeof confirmedOrder.items?.[0]?.item === 'object'
                  ? (confirmedOrder.items[0].item as any).name || 'Your item'
                  : 'Your item'}
              </span>{' '}
              has been confirmed.
            </div>
          </div>
        )}

        {orders.docs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
              <Button asChild>
                <Link href="/">Browse Items</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.docs.map((order: any) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #{String(order.id).slice(-8)}</CardTitle>
                    <Badge
                      variant={
                        order.status === 'pending'
                          ? 'secondary'
                          : order.status === 'completed'
                            ? 'default'
                            : 'destructive'
                      }
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Ordered: {new Date(order.orderDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((line: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {(() => {
                          const s = line.item
                          if (s && typeof s === 'object') {
                            const imgUrl = (s as any)?.image?.url || (s as any)?.imageUrl
                            if (imgUrl) {
                              return (
                                <div className="relative w-16 h-16 rounded overflow-hidden">
                                  <Image
                                    src={imgUrl}
                                    alt={(s as any)?.image?.alt || (s as any)?.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )
                            }
                          }
                          return null
                        })()}
                        <div className="flex-1">
                          <h4 className="font-medium">{(line.item as any)?.name || 'Unknown Item'}</h4>
                          <p className="text-sm text-gray-600">Quantity: {line.quantity}</p>
                          <p className="text-sm text-gray-600">
                            Price: ৳{(((line.item as any)?.price || 0) * line.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="text-right">
                    <span className="text-lg font-bold">
                      Total: ৳{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Payment method</span>
                      <span>{formatPaymentMethod(order.paymentMethod)}</span>
                    </div>
                    {order.paymentSenderNumber && (
                      <div className="flex items-center justify-between">
                        <span>Sender number</span>
                        <span className="font-medium">{order.paymentSenderNumber}</span>
                      </div>
                    )}
                    {order.paymentTransactionId && (
                      <div className="flex items-center justify-between">
                        <span>Transaction ID</span>
                        <span className="font-mono text-xs sm:text-sm break-all">
                          {order.paymentTransactionId}
                        </span>
                      </div>
                    )}
                  </div>
                  {order.status === 'pending' && (
                    <div className="text-right mt-4">
                      <CancelOrderButton orderId={order.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
