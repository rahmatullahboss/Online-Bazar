import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import config from '@/payload.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CartActions } from '@/components/admin/cart-actions'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  ExternalLink,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AbandonedCartsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user || (user as any).role !== 'admin') {
    redirect('/')
  }

  const params = await searchParams
  const statusFilter = params.status || 'all'

  const BDT = '\u09F3'
  const fmtBDT = (n: number) => `${BDT}${n.toFixed(0)}`

  // HEARTBEAT CLEANUP: Mark old active carts as abandoned (runs on each page visit)
  const ABANDONMENT_MINUTES = 30 // 30 minutes of inactivity = abandoned
  const cutoffTime = new Date(Date.now() - ABANDONMENT_MINUTES * 60 * 1000).toISOString()

  const oldActiveCarts = await payload.find({
    collection: 'abandoned-carts',
    where: {
      and: [{ status: { equals: 'active' } }, { lastActivityAt: { less_than: cutoffTime } }],
    },
    limit: 20,
  })

  // Mark them as abandoned (heartbeat cleanup)
  for (const cart of oldActiveCarts.docs) {
    await payload.update({
      collection: 'abandoned-carts',
      id: cart.id,
      data: {
        status: 'abandoned',
        notes: `Auto-abandoned after ${ABANDONMENT_MINUTES} min inactivity`,
      },
    })
  }

  // Also cleanup carts without customer info AND no items (useless carts) older than 24hrs
  const cleanupCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const uselessCarts = await payload.find({
    collection: 'abandoned-carts',
    where: {
      and: [
        { lastActivityAt: { less_than: cleanupCutoff } },
        { customerEmail: { exists: false } },
        { customerName: { exists: false } },
        { customerNumber: { exists: false } },
      ],
    },
    limit: 10,
  })

  for (const cart of uselessCarts.docs) {
    const cartItems = (cart as any).items || []
    if (cartItems.length === 0) {
      await payload.delete({ collection: 'abandoned-carts', id: cart.id })
    }
  }

  // Fetch all carts
  const whereClause: any = {}
  if (statusFilter !== 'all') {
    whereClause.status = { equals: statusFilter }
  }

  const carts = await payload.find({
    collection: 'abandoned-carts',
    depth: 2,
    sort: '-lastActivityAt',
    limit: 100,
    where: whereClause,
  })

  // Filter carts - only show those with customer info OR items
  const filteredCarts = carts.docs.filter((cart: any) => {
    const hasCustomerInfo = cart.customerName || cart.customerEmail || cart.customerNumber
    const hasItems = cart.items && cart.items.length > 0
    return hasCustomerInfo || hasItems
  })

  // Get stats for all statuses
  const allCarts = await payload.find({
    collection: 'abandoned-carts',
    depth: 1,
    limit: 500,
  })

  // Filter for stats too
  const cartsWithInfo = allCarts.docs.filter((c: any) => {
    const hasCustomerInfo = c.customerName || c.customerEmail || c.customerNumber
    const hasItems = c.items && c.items.length > 0
    return hasCustomerInfo || hasItems
  })

  const activeCarts = cartsWithInfo.filter((c: any) => c.status === 'active')
  const abandonedCarts = cartsWithInfo.filter((c: any) => c.status === 'abandoned')
  const recoveredCarts = cartsWithInfo.filter((c: any) => c.status === 'recovered')

  // Calculate potential revenue
  const potentialRevenue = abandonedCarts.reduce(
    (sum: number, cart: any) => sum + (cart.cartTotal || 0),
    0,
  )
  const recoveredRevenue = recoveredCarts.reduce(
    (sum: number, cart: any) => sum + (cart.cartTotal || 0),
    0,
  )

  const statusFilters = [
    {
      key: 'all',
      label: 'All Carts',
      count: allCarts.totalDocs,
      icon: ShoppingCart,
      color: 'bg-gray-500',
    },
    {
      key: 'active',
      label: 'Active',
      count: activeCarts.length,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      key: 'abandoned',
      label: 'Abandoned',
      count: abandonedCarts.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      key: 'recovered',
      label: 'Recovered',
      count: recoveredCarts.length,
      icon: CheckCircle2,
      color: 'bg-blue-500',
    },
  ]

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />

      <AdminPageHeader
        title="Abandoned Carts"
        description="Recover lost sales opportunities"
        iconName="shopping-bag"
      />

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Active Carts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCarts.length}</div>
              <div className="text-xs text-green-600 mt-1">Currently shopping</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Abandoned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{abandonedCarts.length}</div>
              <div className="text-xs text-red-600 mt-1">Needs recovery</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Recovered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{recoveredCarts.length}</div>
              <div className="text-xs text-blue-600 mt-1">Converted to orders</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> At Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{fmtBDT(potentialRevenue)}</div>
              <div className="text-xs text-amber-600 mt-1">Potential revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Recovery Rate */}
        {abandonedCarts.length + recoveredCarts.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Recovery Rate</h3>
                  <p className="text-sm opacity-80">Based on abandoned + recovered carts</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {(
                      (recoveredCarts.length / (abandonedCarts.length + recoveredCarts.length)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm opacity-80">{fmtBDT(recoveredRevenue)} recovered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((f) => (
            <Link
              key={f.key}
              href={`/admin-dashboard/abandoned-carts${f.key !== 'all' ? `?status=${f.key}` : ''}`}
            >
              <Button
                variant={
                  statusFilter === f.key || (!params.status && f.key === 'all')
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

        {/* Carts List */}
        {filteredCarts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No carts found for this filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCarts.map((cart: any) => (
              <Card
                key={cart.id}
                className={`overflow-hidden ${
                  cart.status === 'abandoned'
                    ? 'border-red-200 bg-red-50/30'
                    : cart.status === 'recovered'
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-green-200 bg-green-50/30'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {cart.status === 'active' && <Clock className="w-5 h-5 text-green-500" />}
                        {cart.status === 'abandoned' && (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                        {cart.status === 'recovered' && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        )}
                        {cart.status.charAt(0).toUpperCase() + cart.status.slice(1)} Cart
                        <Badge
                          className={
                            cart.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : cart.status === 'abandoned'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {fmtBDT(cart.cartTotal || 0)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Session: {String(cart.sessionId).slice(0, 16)}...
                        <span className="ml-3">
                          Last activity: {formatTime(cart.lastActivityAt)}
                        </span>
                      </p>
                      {/* Customer Details */}
                      {(cart.customerName || cart.customerEmail || cart.customerNumber) && (
                        <div className="mt-2 p-2 bg-white/50 rounded-lg border border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-1">Customer Info:</p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            {cart.customerName && (
                              <span className="text-gray-900 font-medium">
                                👤 {cart.customerName}
                              </span>
                            )}
                            {cart.customerEmail && (
                              <a
                                href={`mailto:${cart.customerEmail}`}
                                className="text-blue-600 hover:underline"
                              >
                                ✉️ {cart.customerEmail}
                              </a>
                            )}
                            {cart.customerNumber && (
                              <a
                                href={`tel:${cart.customerNumber}`}
                                className="text-green-600 hover:underline"
                              >
                                📞 {cart.customerNumber}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {cart.status === 'recovered' && cart.recoveredOrder && (
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/admin-dashboard/orders?search=${cart.recoveredOrder?.id || cart.recoveredOrder}`}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Order
                          </Link>
                        </Button>
                      )}
                      <CartActions
                        cartId={cart.id}
                        status={cart.status}
                        customerPhone={cart.customerNumber}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Cart Items */}
                  {(cart.items || []).length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {cart.items.length} item{cart.items.length > 1 ? 's' : ''} in cart
                      </div>
                      {cart.items.map((line: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg"
                        >
                          {line.item?.image?.url ? (
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={line.item.image.url}
                                alt={line.item.image.alt || line.item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {line.item?.name || 'Item'}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {line.quantity}</p>
                          </div>
                          <div className="text-sm font-medium">
                            {typeof line.item?.price === 'number'
                              ? fmtBDT(line.item.price * (line.quantity || 1))
                              : '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No items in cart</p>
                    </div>
                  )}

                  {/* Cart Summary */}
                  {cart.status === 'abandoned' && cart.cartTotal > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-red-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Revenue at risk
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {fmtBDT(cart.cartTotal)}
                        </div>
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
