import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(d: Date, months: number) {
  const nd = new Date(d)
  nd.setMonth(nd.getMonth() + months)
  return nd
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(d: Date, days: number) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + days)
  return nd
}

export async function GET(req: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Require admin
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const range = url.searchParams.get('range') || 'this-month'
    const abandonedHours = Number(url.searchParams.get('abandonedHours') || '24')

    const now = new Date()
    let from, to

    if (range === 'all-time') {
      from = new Date(2000, 0, 1)
      to = now
    } else {
      from = startOfMonth(now)
      to = now
    }

    // Helper to fetch orders by where clause
    const findOrders = async (where: any, limit = 5000) => {
      const res = await payload.find({ collection: 'orders', where, depth: 0, limit })
      return res.docs as any[]
    }

    const dateFilter = {
      and: [
        { orderDate: { greater_than_equal: from.toISOString() } },
        { orderDate: { less_than_equal: to.toISOString() } },
      ],
    }

    const completed = await findOrders({ and: [{ status: { equals: 'completed' } }, dateFilter] })
    const pending = await findOrders({ and: [{ status: { equals: 'pending' } }, dateFilter] })
    const cancelled = await findOrders({ and: [{ status: { equals: 'cancelled' } }, dateFilter] })

    const sum = (rows: any[]) => rows.reduce((a, r) => a + Number(r.totalAmount || 0), 0)
    const sumSubtotal = (rows: any[]) => rows.reduce((a, r) => a + Number(r.subtotal || 0), 0)
    const sumShipping = (rows: any[]) => rows.reduce((a, r) => a + Number(r.shippingCharge || 0), 0)

    const grossSales = sum(completed)
    const subtotalAmount = sumSubtotal(completed)
    const shippingAmount = sumShipping(completed)

    const totals = {
      grossSales,
      totalOrders: completed.length + pending.length + cancelled.length,
      activeOrders: pending.length,
      fulfilledOrders: completed.length,
      cancelledOrders: cancelled.length,
    }

    const avgOrderValue = completed.length ? totals.grossSales / completed.length : 0
    const conversionRate = totals.totalOrders ? (completed.length / totals.totalOrders) * 100 : 0

    // New users in range
    const users = await payload.find({
      collection: 'users',
      where: {
        and: [
          { createdAt: { greater_than_equal: from.toISOString() } },
          { createdAt: { less_than_equal: to.toISOString() } },
        ],
      },
      depth: 0,
      limit: 10000,
    })

    // Abandoned carts: from AbandonedCarts collection marked as 'abandoned'
    // Abandoned cart count (prefer AbandonedCarts collection; fallback to pending Orders if table not migrated yet)
    let abandonedCount = 0
    try {
      const abandonedWhere: any = {
        and: [{ status: { equals: 'abandoned' } }],
      }
      if (range !== 'all-time') {
        ;(abandonedWhere.and as any[]).push({
          lastActivityAt: { greater_than_equal: from.toISOString() },
        })
        ;(abandonedWhere.and as any[]).push({
          lastActivityAt: { less_than_equal: to.toISOString() },
        })
      }
      const res = await payload.find({
        collection: 'abandoned-carts',
        where: abandonedWhere,
        depth: 0,
        limit: 1,
      })
      abandonedCount = res.totalDocs ?? res.docs.length
    } catch (e: any) {
      const msg = String(e?.message || '')
      // If the table/columns don't exist yet (42P01/42703), fallback to pending order heuristic
      if (
        msg.includes('relation "abandoned_carts" does not exist') ||
        msg.includes('42703') ||
        msg.includes('42P01')
      ) {
        const fallback = await payload.find({
          collection: 'orders',
          where: {
            and: [
              { status: { equals: 'pending' } },
              {
                orderDate: {
                  less_than_equal: new Date(
                    Date.now() - abandonedHours * 60 * 60 * 1000,
                  ).toISOString(),
                },
              },
            ],
          },
          depth: 0,
          limit: 1,
        })
        abandonedCount = fallback.totalDocs ?? fallback.docs.length
      } else {
        throw e
      }
    }

    // Device distribution from orders in range (fallback by UA)
    const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0, other: 0 }
    const classify = (ua: string) => {
      const u = (ua || '').toLowerCase()
      if (u.includes('mobile') || u.includes('iphone') || u.includes('android')) return 'mobile'
      if (u.includes('ipad') || u.includes('tablet')) return 'tablet'
      if (u.includes('windows') || u.includes('macintosh') || u.includes('linux')) return 'desktop'
      return 'other'
    }
    for (const o of [...completed, ...pending, ...cancelled]) {
      const key = (o as any).deviceType || classify((o as any).userAgent || '')
      deviceCounts[key] = (deviceCounts[key] || 0) + 1
    }

    // Build last 12 months series for completed orders
    const start12 = startOfMonth(addMonths(now, -11))
    const last12 = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { status: { equals: 'completed' } },
          { orderDate: { greater_than_equal: start12.toISOString() } },
          { orderDate: { less_than_equal: to.toISOString() } },
        ],
      },
      depth: 0,
      limit: 10000,
      sort: 'orderDate',
    })

    const seriesMap = new Map<string, number>()
    for (let i = 0; i < 12; i++) {
      const d = addMonths(start12, i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      seriesMap.set(key, 0)
    }
    for (const o of last12.docs as any[]) {
      const d = new Date(o.orderDate)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      seriesMap.set(key, (seriesMap.get(key) || 0) + Number(o.totalAmount || 0))
    }
    const salesSeries = Array.from(seriesMap.entries()).map(([key, value]) => ({
      month: key,
      value,
    }))

    // Daily sales data for the last 30 days
    const dailySalesData = []
    if (range !== 'all-time') {
      const startDate = addDays(now, -30)
      const dailyMap = new Map<string, { orders: number; sales: number }>()

      // Initialize map with last 30 days
      for (let i = 0; i < 30; i++) {
        const d = addDays(startDate, i)
        const key = d.toISOString().split('T')[0]
        dailyMap.set(key, { orders: 0, sales: 0 })
      }

      // Populate with actual data
      for (const order of completed) {
        const orderDate = new Date(order.orderDate)
        const key = orderDate.toISOString().split('T')[0]
        if (dailyMap.has(key)) {
          const current = dailyMap.get(key)!
          dailyMap.set(key, {
            orders: current.orders + 1,
            sales: current.sales + Number(order.totalAmount || 0),
          })
        }
      }

      // Convert to array
      dailySalesData.push(
        ...Array.from(dailyMap.entries()).map(([date, data]) => ({
          date,
          orders: data.orders,
          sales: data.sales,
          avgOrderValue: data.orders > 0 ? data.sales / data.orders : 0,
        })),
      )
    }

    return NextResponse.json({
      range,
      from: from.toISOString(),
      to: to.toISOString(),
      totals: { ...totals, avgOrderValue, conversionRate },
      salesSeries,
      dailySalesData,
      breakdown: {
        grossSales: totals.grossSales,
        subtotal: subtotalAmount,
        shipping: shippingAmount,
        discounts: 0,
        returns: 0,
        deliveryCharge: shippingAmount,
      },
      users: { newUsers: users.totalDocs ?? users.docs.length },
      devices: deviceCounts,
      carts: { abandoned: abandonedCount },
    })
  } catch (e) {
    console.error('metrics error', e)
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 })
  }
}
