import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const body = await request.json()
    const { firstName, lastName, email, password, phone, address, deliveryZone, otpCode } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !otpCode) {
      return NextResponse.json(
        { error: 'First name, last name, email, password, and OTP code are required' },
        { status: 400 },
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 },
      )
    }

    // Validate phone format if provided
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please provide a valid Bangladeshi phone number (01XXXXXXXXX)' },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 },
      )
    }

    // Verify OTP
    const otpRecords = await payload.find({
      collection: 'otps',
      where: {
        and: [
          { email: { equals: email } },
          { code: { equals: otpCode } },
          { type: { equals: 'registration' } },
          { isVerified: { equals: true } },
          { expiresAt: { greater_than: new Date().toISOString() } },
        ],
      },
      limit: 1,
      sort: '-createdAt',
    })

    if (otpRecords.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code. Please verify your email first.' },
        { status: 400 },
      )
    }

    // Create user account
    const userData: any = {
      firstName,
      lastName,
      email,
      password,
      role: 'user',
    }

    // Add optional fields
    if (phone) userData.customerNumber = phone
    if (deliveryZone) userData.deliveryZone = deliveryZone
    if (address) {
      userData.address = {
        line1: address.line1 || undefined,
        line2: address.line2 || undefined,
        city: address.city || undefined,
        state: address.state || undefined,
        postalCode: address.postalCode || undefined,
        country: address.country || 'Bangladesh',
      }
    }

    const newUser = await payload.create({
      collection: 'users',
      data: userData,
    })

    // Clean up verified OTP
    await payload.delete({
      collection: 'otps',
      id: otpRecords.docs[0].id,
    })

    // Return success response (don't include password)
    const { password: _, ...userResponse } = newUser as any

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userResponse,
    })
  } catch (error) {
    console.error('User registration error:', error)

    // Handle specific Payload errors
    if (error instanceof Error) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 },
    )
  }
}
