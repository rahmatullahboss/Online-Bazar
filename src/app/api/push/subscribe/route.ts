import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get current user from cookie
    const token = request.cookies.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - please login' }, { status: 401 })
    }

    // Verify user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    // Check if subscription already exists for this endpoint
    const existingSubscription = await payload.find({
      collection: 'push-subscriptions',
      where: {
        endpoint: {
          equals: subscription.endpoint,
        },
      },
      limit: 1,
    })

    if (existingSubscription.docs.length > 0) {
      // Update existing subscription
      await payload.update({
        collection: 'push-subscriptions',
        id: existingSubscription.docs[0].id,
        data: {
          user: user.id,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
          userAgent: request.headers.get('user-agent') || undefined,
          isActive: true,
        },
      })

      return NextResponse.json({ success: true, message: 'Subscription updated' })
    }

    // Create new subscription
    await payload.create({
      collection: 'push-subscriptions',
      data: {
        user: user.id,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent: request.headers.get('user-agent') || undefined,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, message: 'Subscription created' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get current user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    // Find and delete subscription
    const subscription = await payload.find({
      collection: 'push-subscriptions',
      where: {
        endpoint: {
          equals: endpoint,
        },
        user: {
          equals: user.id,
        },
      },
      limit: 1,
    })

    if (subscription.docs.length > 0) {
      await payload.delete({
        collection: 'push-subscriptions',
        id: subscription.docs[0].id,
      })
    }

    return NextResponse.json({ success: true, message: 'Subscription removed' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
