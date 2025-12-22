import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import config from '@/payload.config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/site-header'
import {
  Clock,
  Loader2,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  MessageCircle,
  ArrowRight,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Redirect to login if not authenticated or not admin
  if (!user || (user as any).role !== 'admin') {
    redirect('/')
  }

  // Currency helper (BDT)
  const BDT = '\u09F3'
  const fmtBDT = (n: number) => `${BDT}${n.toFixed(0)}`

  // Get today's date range
  const today = new Date()
  const startOfDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0),
  )
  const endOfDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 0, 0, 0, 0),
  )

  // Fetch today's orders
  const ordersToday = await payload.find({
    collection: 'orders',
    depth: 1,
    limit: 100,
    where: {
      orderDate: {
        greater_than_equal: startOfDay.toISOString(),
        less_than: endOfDay.toISOString(),
      },
    },
  })

  // Fetch all recent orders for stats
  const allOrders = await payload.find({
    collection: 'orders',
    depth: 1,
    limit: 100,
    sort: '-orderDate',
  })

  // Fetch abandoned carts
  const abandonedCarts = await payload.find({
    collection: 'abandoned-carts',
    depth: 1,
    limit: 50,
    where: { status: { equals: 'abandoned' } },
  })

  // Fetch recent chat conversations
  const recentChats = await payload.find({
    collection: 'chat-conversations',
    depth: 1,
    limit: 5,
    sort: '-lastMessageAt',
  })

  // Calculate stats
  const pendingOrders = allOrders.docs.filter((order: any) => order.status === 'pending')
  const processingOrders = allOrders.docs.filter((order: any) => order.status === 'processing')
  const shippedOrders = allOrders.docs.filter((order: any) => order.status === 'shipped')
  const completedOrders = allOrders.docs.filter((order: any) => order.status === 'completed')
  const cancelledOrders = allOrders.docs.filter((order: any) => order.status === 'cancelled')
  const refundedOrders = allOrders.docs.filter((order: any) => order.status === 'refunded')

  // Today's revenue
  const todayRevenue = ordersToday.docs.reduce((sum: number, order: any) => {
    if (order.status !== 'cancelled' && order.status !== 'refunded') {
      return sum + (order.totalAmount || 0)
    }
    return sum
  }, 0)

  // Quick action cards
  const quickActions = [
    {
      title: 'Orders',
      description: 'View and manage all orders',
      href: '/admin-dashboard/orders',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      stat: `${pendingOrders.length} pending`,
    },
    {
      title: 'Analytics',
      description: 'Business insights & trends',
      href: '/admin-dashboard/analytics',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      stat: 'View reports',
    },
    {
      title: 'Sales Report',
      description: 'Daily revenue breakdown',
      href: '/admin-dashboard/sales-report',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      stat: fmtBDT(todayRevenue) + ' today',
    },
    {
      title: 'Customers',
      description: 'Customer management',
      href: '/admin-dashboard/customers',
      icon: Users,
      color: 'from-amber-500 to-amber-600',
      stat: 'View all',
    },
    {
      title: 'Abandoned Carts',
      description: 'Recover lost sales',
      href: '/admin-dashboard/abandoned-carts',
      icon: ShoppingBag,
      color: 'from-red-500 to-red-600',
      stat: `${abandonedCarts.totalDocs} carts`,
    },
    {
      title: 'Chat Inbox',
      description: 'Customer messages',
      href: '/admin-dashboard/chat-inbox',
      icon: MessageCircle,
      color: 'from-violet-500 to-violet-600',
      stat: `${recentChats.totalDocs} chats`,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Admin! 👋</h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Order Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="text-white w-4 h-4" />
                </div>
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
              <div className="text-xs text-yellow-600 mt-1">Needs action</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Loader2 className="text-white w-4 h-4" />
                </div>
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{processingOrders.length}</div>
              <div className="text-xs text-blue-600 mt-1">In progress</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Truck className="text-white w-4 h-4" />
                </div>
                Shipped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{shippedOrders.length}</div>
              <div className="text-xs text-purple-600 mt-1">On the way</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-white w-4 h-4" />
                </div>
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
              <div className="text-xs text-green-600 mt-1">Delivered</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="text-white w-4 h-4" />
                </div>
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cancelledOrders.length}</div>
              <div className="text-xs text-red-600 mt-1">Cancelled</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <RotateCcw className="text-white w-4 h-4" />
                </div>
                Refunded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{refundedOrders.length}</div>
              <div className="text-xs text-gray-600 mt-1">Refunded</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Today&apos;s Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{fmtBDT(todayRevenue)}</div>
              <div className="text-xs opacity-80 mt-1">{ordersToday.totalDocs} orders today</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {pendingOrders.length + abandonedCarts.totalDocs}
              </div>
              <div className="text-xs opacity-80 mt-1">
                {pendingOrders.length} orders, {abandonedCarts.totalDocs} carts
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Recent Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentChats.totalDocs}</div>
              <div className="text-xs opacity-80 mt-1">Customer conversations</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-4">{action.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    <Badge variant="secondary" className="mt-3">
                      {action.stat}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              Recent Orders
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin-dashboard/orders">View All Orders</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {allOrders.docs.slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {allOrders.docs.slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Order #{String(order.id).slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerName || order.user?.firstName || 'Customer'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {order.status}
                      </Badge>
                      <span className="font-semibold text-gray-900">
                        {fmtBDT(order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
