import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

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
    const daysParam = url.searchParams.get('days') || '7'
    const days = Math.min(Math.max(parseInt(daysParam) || 7, 7), 90)

    const now = new Date()
    const startDate = addDays(now, -days + 1)
    const endDate = now

    console.log(
      `Fetching sales report for ${days} days, from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    )

    // Fetch completed orders in the date range
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { status: { equals: 'completed' } },
          { orderDate: { greater_than_equal: startDate.toISOString() } },
          { orderDate: { less_than_equal: endDate.toISOString() } },
        ],
      },
      depth: 0,
      limit: 10000,
      sort: 'orderDate',
    })

    console.log(`Found ${orders.docs.length} completed orders`)

    // Group orders by date
    const dailyData = new Map<string, { orders: number; sales: number }>()

    // Initialize map with all dates
    for (let i = 0; i < days; i++) {
      const d = addDays(startDate, i)
      const key = d.toISOString().split('T')[0]
      dailyData.set(key, { orders: 0, sales: 0 })
    }

    // Populate with actual data
    for (const order of orders.docs as any[]) {
      try {
        const orderDate = new Date(order.orderDate)
        const key = orderDate.toISOString().split('T')[0]
        if (dailyData.has(key)) {
          const current = dailyData.get(key)!
          dailyData.set(key, {
            orders: current.orders + 1,
            sales: current.sales + Number(order.totalAmount || 0),
          })
        }
      } catch (e) {
        console.error('Error processing order:', order, e)
      }
    }

    // Convert to array and calculate averages
    const result = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      orders: data.orders,
      sales: data.sales,
      avgOrderValue: data.orders > 0 ? data.sales / data.orders : 0,
    }))

    console.log(`Returning ${result.length} days of data`)
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('Sales report error:', e)
    return NextResponse.json(
      {
        error: 'Failed to load sales report',
        details: e.message,
        stack: e.stack,
      },
      { status: 500 },
    )
  }
}
