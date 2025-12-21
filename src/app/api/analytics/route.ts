import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

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

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    // Check admin access
    if (!user || (user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date ranges
    const now = new Date()
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const weekStart = new Date(todayStart)
    weekStart.setUTCDate(weekStart.getUTCDate() - 7)
    const monthStart = new Date(todayStart)
    monthStart.setUTCMonth(monthStart.getUTCMonth() - 1)

    // Fetch all orders
    const allOrders = await payload.find({
      collection: 'orders',
      limit: 10000,
      depth: 2,
    })

    const orders = allOrders.docs as unknown as Array<{
      id: string
      status: string
      totalAmount: number
      orderDate: string
      customerName: string
      customerEmail: string
      user?: { id: string } | string
      paymentMethod?: string
      deliveryZone?: string
      items: Array<{
        item: { id: string; name: string; price: number; image?: { url: string } } | string
        quantity: number
      }>
    }>

    // Filter by status (exclude cancelled and refunded for revenue)
    const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')

    // Today's stats
    const todayOrders = validOrders.filter((o) => new Date(o.orderDate) >= todayStart)
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    // This week stats
    const weekOrders = validOrders.filter((o) => new Date(o.orderDate) >= weekStart)
    const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    // This month stats
    const monthOrders = validOrders.filter((o) => new Date(o.orderDate) >= monthStart)
    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    // All time stats
    const allTimeRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    const averageOrderValue = validOrders.length > 0 ? allTimeRevenue / validOrders.length : 0

    // Top selling products
    const productSales: Record<
      string,
      {
        id: string
        name: string
        imageUrl?: string
        quantity: number
        revenue: number
        orders: number
      }
    > = {}

    for (const order of validOrders) {
      for (const item of order.items || []) {
        const product = typeof item.item === 'object' ? item.item : null
        if (!product) continue

        const productId = String(product.id)
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: product.name || 'Unknown',
            imageUrl: product.image?.url,
            quantity: 0,
            revenue: 0,
            orders: 0,
          }
        }
        productSales[productId].quantity += item.quantity || 1
        productSales[productId].revenue += (product.price || 0) * (item.quantity || 1)
        productSales[productId].orders += 1
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        totalQuantity: p.quantity,
        totalRevenue: p.revenue,
        orderCount: p.orders,
      }))

    // Customer stats
    const registeredOrders = validOrders.filter((o) => o.user)
    const guestOrders = validOrders.filter((o) => !o.user)
    const uniqueCustomers = new Set(
      registeredOrders.map((o) => (typeof o.user === 'object' ? o.user.id : o.user)),
    )
    const newCustomersThisMonth = monthOrders.filter((o) => o.user).length // Simplified

    // Payment method breakdown
    const paymentMethods = {
      cod: { count: 0, revenue: 0 },
      bkash: { count: 0, revenue: 0 },
      nagad: { count: 0, revenue: 0 },
    }

    for (const order of validOrders) {
      const method = order.paymentMethod as keyof typeof paymentMethods
      if (method && paymentMethods[method]) {
        paymentMethods[method].count += 1
        paymentMethods[method].revenue += order.totalAmount || 0
      } else {
        paymentMethods.cod.count += 1
        paymentMethods.cod.revenue += order.totalAmount || 0
      }
    }

    // Delivery zone breakdown
    const deliveryZones = {
      insideDhaka: { count: 0, revenue: 0 },
      outsideDhaka: { count: 0, revenue: 0 },
    }

    for (const order of validOrders) {
      if (order.deliveryZone === 'inside_dhaka') {
        deliveryZones.insideDhaka.count += 1
        deliveryZones.insideDhaka.revenue += order.totalAmount || 0
      } else {
        deliveryZones.outsideDhaka.count += 1
        deliveryZones.outsideDhaka.revenue += order.totalAmount || 0
      }
    }

    // Low stock products
    const items = await payload.find({
      collection: 'items',
      limit: 1000,
      where: {
        available: { equals: true },
      },
    })

    const lowStockProducts = (
      items.docs as unknown as Array<{
        id: string
        name: string
        inventoryManagement?: { stock: number; lowStockThreshold: number; trackInventory: boolean }
        image?: { url: string }
      }>
    )
      .filter((item) => {
        const inv = item.inventoryManagement
        if (!inv?.trackInventory) return false
        return inv.stock <= (inv.lowStockThreshold || 5)
      })
      .map((item) => ({
        id: String(item.id),
        name: item.name,
        stock: item.inventoryManagement?.stock || 0,
        lowStockThreshold: item.inventoryManagement?.lowStockThreshold || 5,
        imageUrl: item.image?.url,
      }))
      .slice(0, 10)

    // Recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5)
      .map((o) => ({
        id: String(o.id),
        customerName: o.customerName,
        status: o.status,
        totalAmount: o.totalAmount,
        orderDate: o.orderDate,
      }))

    const analytics: AnalyticsData = {
      summary: {
        today: { orders: todayOrders.length, revenue: todayRevenue },
        thisWeek: { orders: weekOrders.length, revenue: weekRevenue },
        thisMonth: { orders: monthOrders.length, revenue: monthRevenue },
        allTime: {
          orders: validOrders.length,
          revenue: allTimeRevenue,
          averageOrderValue,
        },
      },
      topProducts,
      customerStats: {
        totalCustomers: uniqueCustomers.size,
        newCustomersThisMonth,
        returningCustomers: uniqueCustomers.size - newCustomersThisMonth,
        guestOrders: guestOrders.length,
      },
      paymentMethods,
      deliveryZones,
      lowStockProducts,
      recentOrders,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics failed:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
