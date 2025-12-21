'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, Package, DollarSign, Users, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalyticsData {
  summary: {
    today: { orders: number; revenue: number }
    thisWeek: { orders: number; revenue: number }
    thisMonth: { orders: number; revenue: number }
    allTime: { orders: number; revenue: number; averageOrderValue: number }
  }
  topProducts: Array<{
    id: string
    name: string
    imageUrl?: string
    totalQuantity: number
    totalRevenue: number
    orderCount: number
  }>
  customerStats: {
    totalCustomers: number
    newCustomersThisMonth: number
    returningCustomers: number
    guestOrders: number
  }
  paymentMethods: {
    cod: { count: number; revenue: number }
    bkash: { count: number; revenue: number }
    nagad: { count: number; revenue: number }
  }
  deliveryZones: {
    insideDhaka: { count: number; revenue: number }
    outsideDhaka: { count: number; revenue: number }
  }
  lowStockProducts: Array<{
    id: string
    name: string
    stock: number
    lowStockThreshold: number
    imageUrl?: string
  }>
  recentOrders: Array<{
    id: string
    customerName: string
    status: string
    totalAmount: number
    orderDate: string
  }>
}

const formatBDT = (n: number) =>
  `৳${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics')
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const analytics = await response.json()
        setData(analytics)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        Failed to load analytics: {error}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(data.summary.today.revenue)}</div>
            <div className="text-xs opacity-80">{data.summary.today.orders} orders</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(data.summary.thisWeek.revenue)}</div>
            <div className="text-xs opacity-80">{data.summary.thisWeek.orders} orders</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Package className="h-4 w-4" /> This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(data.summary.thisMonth.revenue)}</div>
            <div className="text-xs opacity-80">{data.summary.thisMonth.orders} orders</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Users className="h-4 w-4" /> Avg Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBDT(data.summary.allTime.averageOrderValue)}
            </div>
            <div className="text-xs opacity-80">{data.summary.allTime.orders} total orders</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.totalQuantity} sold • {product.orderCount} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatBDT(product.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
              {data.topProducts.length === 0 && (
                <p className="text-center text-gray-500 py-4">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods & Zones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Payment & Delivery Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Payment Methods */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h4>
                <div className="space-y-2">
                  {[
                    {
                      label: 'Cash on Delivery',
                      ...data.paymentMethods.cod,
                      color: 'bg-green-500',
                    },
                    { label: 'bKash', ...data.paymentMethods.bkash, color: 'bg-pink-500' },
                    { label: 'Nagad', ...data.paymentMethods.nagad, color: 'bg-orange-500' },
                  ].map((method) => {
                    const total =
                      data.paymentMethods.cod.count +
                      data.paymentMethods.bkash.count +
                      data.paymentMethods.nagad.count
                    const percentage = total > 0 ? (method.count / total) * 100 : 0
                    return (
                      <div key={method.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{method.label}</span>
                          <span className="font-medium">
                            {method.count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${method.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Delivery Zones */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Delivery Zones</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {data.deliveryZones.insideDhaka.count}
                    </div>
                    <div className="text-xs text-gray-600">Inside Dhaka</div>
                    <div className="text-sm font-medium text-gray-800 mt-1">
                      {formatBDT(data.deliveryZones.insideDhaka.revenue)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {data.deliveryZones.outsideDhaka.count}
                    </div>
                    <div className="text-xs text-gray-600">Outside Dhaka</div>
                    <div className="text-sm font-medium text-gray-800 mt-1">
                      {formatBDT(data.deliveryZones.outsideDhaka.revenue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Customer Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.customerStats.totalCustomers}
                </div>
                <div className="text-xs text-gray-600">Registered Customers</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.customerStats.newCustomersThisMonth}
                </div>
                <div className="text-xs text-gray-600">New This Month</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.customerStats.returningCustomers}
                </div>
                <div className="text-xs text-gray-600">Returning Customers</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {data.customerStats.guestOrders}
                </div>
                <div className="text-xs text-gray-600">Guest Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className={data.lowStockProducts.length > 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${data.lowStockProducts.length > 0 ? 'text-red-500' : 'text-gray-400'}`}
              />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 bg-white rounded-lg border border-red-100"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-red-600">
                        Only {product.stock} left (threshold: {product.lowStockThreshold})
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {product.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>All products are well stocked!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
