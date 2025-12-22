import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import { redirect } from 'next/navigation'
import Image from 'next/image'

import config from '@/payload.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { OrderStatusUpdate } from '@/components/lazy-client-components'
import { DateFilter } from '../DateFilter'
import { ShoppingCart, Clock, Loader2, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; start?: string; end?: string; status?: string }>
}) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user || (user as any).role !== 'admin') {
    redirect('/')
  }

  const BDT = '\u09F3'
  const fmtBDT = (n: number) => `${BDT}${n.toFixed(2)}`

  const formatPaymentMethod = (method?: string | null) => {
    switch (method) {
      case 'bkash':
        return 'bKash'
      case 'nagad':
        return 'Nagad'
      case 'cod':
      default:
        return 'Cash on Delivery'
    }
  }

  const isDigitalPayment = (method?: string | null) => method === 'bkash' || method === 'nagad'

  const params = await searchParams
  const { date: paramDate, start: startParam, end: endParam, status: statusFilter } = params

  const toDateOnly = (d: Date) => {
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isDateOnly = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)

  let selectedDateOnly: string | undefined
  let selectedRange: { start: string; end: string } | undefined
  if (isDateOnly(startParam) && isDateOnly(endParam)) {
    selectedRange = { start: startParam!, end: endParam! }
  } else if (isDateOnly(paramDate)) {
    selectedDateOnly = paramDate!
  } else {
    selectedDateOnly = toDateOnly(new Date())
  }

  let start: Date
  let endExclusive: Date
  if (selectedRange) {
    const [y1, m1, d1] = selectedRange.start.split('-').map(Number)
    const [y2, m2, d2] = selectedRange.end.split('-').map(Number)
    start = new Date(Date.UTC(y1, m1 - 1, d1, 0, 0, 0, 0))
    endExclusive = new Date(Date.UTC(y2, m2 - 1, d2 + 1, 0, 0, 0, 0))
  } else {
    const [year, month, day] = (selectedDateOnly as string).split('-').map(Number)
    start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    endExclusive = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0))
  }

  // Build where clause
  const whereClause: any = {
    orderDate: {
      greater_than_equal: start.toISOString(),
      less_than: endExclusive.toISOString(),
    },
  }

  if (statusFilter && statusFilter !== 'all') {
    whereClause.status = { equals: statusFilter }
  }

  const orders = await payload.find({
    collection: 'orders',
    depth: 3,
    sort: '-orderDate',
    limit: 100,
    where: whereClause,
  })

  // Order counts for filter badges
  const allOrdersForStats = await payload.find({
    collection: 'orders',
    depth: 1,
    limit: 500,
    where: {
      orderDate: {
        greater_than_equal: start.toISOString(),
        less_than: endExclusive.toISOString(),
      },
    },
  })

  const pendingCount = allOrdersForStats.docs.filter((o: any) => o.status === 'pending').length
  const processingCount = allOrdersForStats.docs.filter(
    (o: any) => o.status === 'processing',
  ).length
  const shippedCount = allOrdersForStats.docs.filter((o: any) => o.status === 'shipped').length
  const completedCount = allOrdersForStats.docs.filter((o: any) => o.status === 'completed').length
  const cancelledCount = allOrdersForStats.docs.filter((o: any) => o.status === 'cancelled').length
  const refundedCount = allOrdersForStats.docs.filter((o: any) => o.status === 'refunded').length

  const statusFilters = [
    {
      key: 'all',
      label: 'All',
      count: allOrdersForStats.totalDocs,
      icon: ShoppingCart,
      color: 'bg-gray-500',
    },
    { key: 'pending', label: 'Pending', count: pendingCount, icon: Clock, color: 'bg-yellow-500' },
    {
      key: 'processing',
      label: 'Processing',
      count: processingCount,
      icon: Loader2,
      color: 'bg-blue-500',
    },
    { key: 'shipped', label: 'Shipped', count: shippedCount, icon: Truck, color: 'bg-purple-500' },
    {
      key: 'completed',
      label: 'Completed',
      count: completedCount,
      icon: CheckCircle2,
      color: 'bg-green-500',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: cancelledCount,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      key: 'refunded',
      label: 'Refunded',
      count: refundedCount,
      icon: RotateCcw,
      color: 'bg-gray-500',
    },
  ]

  const buildFilterUrl = (newStatus: string) => {
    const params = new URLSearchParams()
    if (selectedRange) {
      params.set('start', selectedRange.start)
      params.set('end', selectedRange.end)
    } else if (selectedDateOnly) {
      params.set('date', selectedDateOnly)
    }
    if (newStatus !== 'all') {
      params.set('status', newStatus)
    }
    return `/admin-dashboard/orders?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />

      <AdminPageHeader
        title="Orders Management"
        description={`${orders.totalDocs} orders found`}
        icon={ShoppingCart}
        action={
          <DateFilter
            initialMode={selectedRange ? 'range' : 'single'}
            initialDate={selectedDateOnly}
            initialStart={selectedRange?.start}
            initialEnd={selectedRange?.end}
          />
        }
      />

      <div className="container mx-auto px-4 py-6">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((f) => (
            <Link key={f.key} href={buildFilterUrl(f.key)}>
              <Button
                variant={
                  statusFilter === f.key || (!statusFilter && f.key === 'all')
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="gap-2"
              >
                <div className={`w-5 h-5 rounded-full ${f.color} flex items-center justify-center`}>
                  <f.icon className="w-3 h-3 text-white" />
                </div>
                {f.label}
                <Badge variant="secondary" className="ml-1">
                  {f.count}
                </Badge>
              </Button>
            </Link>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedRange ? `${selectedRange.start} to ${selectedRange.end}` : selectedDateOnly}
          </h2>
          {!selectedRange && (
            <div className="flex gap-2">
              {(() => {
                const cur = new Date(start)
                const prev = new Date(cur)
                prev.setUTCDate(cur.getUTCDate() - 1)
                const next = new Date(cur)
                next.setUTCDate(cur.getUTCDate() + 1)
                const today = toDateOnly(new Date())
                const prevStr = toDateOnly(prev)
                const nextStr = toDateOnly(next)
                return (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin-dashboard/orders?date=${prevStr}${statusFilter ? `&status=${statusFilter}` : ''}`}
                      >
                        Previous Day
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" disabled={nextStr > today}>
                      <Link
                        href={`/admin-dashboard/orders?date=${nextStr}${statusFilter ? `&status=${statusFilter}` : ''}`}
                      >
                        Next Day
                      </Link>
                    </Button>
                  </>
                )
              })()}
            </div>
          )}
        </div>

        {/* Orders List */}
        {orders.docs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No orders found for this selection.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.docs.map((order: any) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Order #{String(order.id).slice(-8)}
                        <Badge
                          className={
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : order.status === 'shipped'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : order.status === 'completed'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : order.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.user ? (
                          <>
                            {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                          </>
                        ) : (
                          <>
                            {order.customerName} ({order.customerEmail})
                          </>
                        )}
                        {order.customerNumber && (
                          <span className="ml-2">• {order.customerNumber}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.orderDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'UTC',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {fmtBDT(order.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPaymentMethod(order.paymentMethod)}
                        </div>
                      </div>
                      <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        {item.item?.image?.url && (
                          <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.item.image.url}
                              alt={item.item.image.alt || item.item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.item?.name || 'Unknown Item'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × {fmtBDT(item.item?.price || 0)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {fmtBDT((item.item?.price || 0) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping & Payment Details */}
                  {(order.shippingAddress || isDigitalPayment(order.paymentMethod)) && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {isDigitalPayment(order.paymentMethod) && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Payment Info</h4>
                            <p className="text-gray-600">
                              Sender: {order.paymentSenderNumber || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              TxnID: {order.paymentTransactionId || 'N/A'}
                            </p>
                          </div>
                        )}
                        {order.shippingAddress && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Shipping Address</h4>
                            <p className="text-gray-600">
                              {order.shippingAddress.line1}
                              {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
                              <br />
                              {order.shippingAddress.city}
                              {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                              <br />
                              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
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
