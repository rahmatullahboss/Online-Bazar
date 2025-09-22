import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  console.log('Me route called')
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: request.headers })
  console.log('Authenticated user:', user)
  if (!user) {
    console.log('No user found, returning 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Return a trimmed user object
  return NextResponse.json({
    id: (user as any).id,
    email: (user as any).email,
    firstName: (user as any).firstName,
    lastName: (user as any).lastName,
    customerNumber: (user as any).customerNumber || null,
    deliveryZone: (user as any).deliveryZone || null,
    address: (user as any).address || null,
  })
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('Update me route called')
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })
    console.log('Authenticated user:', user)
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Update body:', body)
    const data: any = {}

    if (typeof body.firstName === 'string') data.firstName = body.firstName
    if (typeof body.lastName === 'string') data.lastName = body.lastName
    if (typeof body.email === 'string') data.email = body.email
    if (typeof body.customerNumber === 'string') data.customerNumber = body.customerNumber

    if (typeof body.deliveryZone === 'string') {
      const normalized = body.deliveryZone.toLowerCase().replace(/[\s-]+/g, '_')
      if (normalized === 'outside_dhaka' || normalized === 'inside_dhaka') {
        data.deliveryZone = normalized
      }
    }
    if (body.address && typeof body.address === 'object') {
      const a = body.address
      data.address = {
        line1: typeof a.line1 === 'string' ? a.line1 : undefined,
        line2: typeof a.line2 === 'string' ? a.line2 : undefined,
        city: typeof a.city === 'string' ? a.city : undefined,
        state: typeof a.state === 'string' ? a.state : undefined,
        postalCode: typeof a.postalCode === 'string' ? a.postalCode : undefined,
        country: typeof a.country === 'string' ? a.country : undefined,
      }
    }

    console.log('Updating user with data:', data)
    const updated = await payload.update({ collection: 'users', id: (user as any).id, data })
    console.log('Update result:', updated)
    return NextResponse.json({ success: true, user: updated })
  } catch (e) {
    console.error('Update me error:', e)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
