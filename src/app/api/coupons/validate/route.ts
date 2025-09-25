import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('@/payload.config')).default })
    const body = await req.json()
    const { code, subtotal } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    // নতুন চেক: subtotal ঠিক আছে কিনা তা যাচাই করুন
    if (typeof subtotal !== 'number' || subtotal < 0) {
      return NextResponse.json({ error: 'Subtotal is required to validate coupon' }, { status: 400 })
    }

    const now = new Date()
    const coupon = await payload.find({
      collection: 'coupons' as any,
      where: {
        and: [
          { code: { equals: code.toUpperCase() } },
          { isActive: { equals: true } },
          {
            or: [
              { expiryDate: { greater_than: now.toISOString() } },
              { expiryDate: { equals: null } }
            ]
          }
        ],
      },
    })

    if (coupon.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
    }

    const couponDoc = coupon.docs[0]
    const usageLimit = (couponDoc as any).usageLimit || 0
    const usedCount = (couponDoc as any).usedCount || 0
    if (usageLimit > 0 && usedCount >= usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    const discountType = (couponDoc as any).discountType
    const discountValue = Number((couponDoc as any).discountValue)

    if (discountType === 'percent') {
      discountAmount = (subtotal * discountValue) / 100
    } else if (discountType === 'fixed') {
      discountAmount = Math.min(subtotal, discountValue)
    }

    return NextResponse.json({
      success: true,
      coupon: couponDoc,
      discountAmount,
      discountType,
      discountValue,
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
