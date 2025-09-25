import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('@/payload.config')).default })
    const body = await req.json()
    console.log('Coupon validate request body:', body)
    const { code, subtotal } = body
    console.log('Extracted code:', code, 'subtotal:', subtotal)

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    // নতুন চেক: subtotal ঠিক আছে কিনা তা যাচাই করুন
    if (typeof subtotal !== 'number' || subtotal < 0) {
      console.log('Subtotal validation failed')
      return NextResponse.json(
        { error: 'Subtotal is required to validate coupon' },
        { status: 400 },
      )
    }

    const now = new Date()
    console.log('Searching for coupon with code:', code, 'expiry after:', now.toISOString())
    const allActiveCoupons = await payload.find({
      collection: 'coupons' as any,
      where: {
        and: [
          { isActive: { equals: true } },
          {
            or: [
              { expiryDate: { greater_than: now.toISOString() } },
              { expiryDate: { equals: null } },
            ],
          },
        ],
      },
    })
    console.log('Active coupons found:', allActiveCoupons.docs.length)
    const matchingCoupon = allActiveCoupons.docs.find(
      (doc) => doc.code.toLowerCase() === code.toLowerCase(),
    )
    console.log('Case-insensitive match found:', !!matchingCoupon)

    if (!matchingCoupon) {
      console.log('No coupon found')
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
    }

    const couponDoc = matchingCoupon
    console.log(
      'Found coupon:',
      couponDoc.id,
      'isActive:',
      couponDoc.isActive,
      'expiry:',
      couponDoc.expiryDate,
    )
    const usageLimit = (couponDoc as any).usageLimit || 0
    const usedCount = (couponDoc as any).usedCount || 0
    console.log('Usage limit:', usageLimit, 'used:', usedCount)
    if (usageLimit > 0 && usedCount >= usageLimit) {
      console.log('Usage limit exceeded')
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
