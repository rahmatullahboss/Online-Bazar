import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const body = await request.json()
    const { email, phone, code, type = 'registration' } = body

    // Validate input
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone number is required' },
        { status: 400 },
      )
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Please provide a valid 6-digit OTP code' },
        { status: 400 },
      )
    }

    // Find the OTP record
    const otpRecords = await payload.find({
      collection: 'otps',
      where: {
        and: [
          {
            or: [
              ...(email ? [{ email: { equals: email } }] : []),
              ...(phone ? [{ phone: { equals: phone } }] : []),
            ],
          },
          { code: { equals: code } },
          { type: { equals: type } },
          { isVerified: { equals: false } },
          { expiresAt: { greater_than: new Date().toISOString() } },
        ],
      },
      limit: 1,
      sort: '-createdAt', // Get the most recent one
    })

    if (otpRecords.docs.length === 0) {
      // Check if there's an expired or already verified OTP
      const existingRecords = await payload.find({
        collection: 'otps',
        where: {
          and: [
            {
              or: [
                ...(email ? [{ email: { equals: email } }] : []),
                ...(phone ? [{ phone: { equals: phone } }] : []),
              ],
            },
            { code: { equals: code } },
            { type: { equals: type } },
          ],
        },
        limit: 1,
        sort: '-createdAt',
      })

      if (existingRecords.docs.length > 0) {
        const record = existingRecords.docs[0]
        if (record.isVerified) {
          return NextResponse.json(
            { error: 'This OTP code has already been used' },
            { status: 400 },
          )
        }
        if (new Date(record.expiresAt) < new Date()) {
          return NextResponse.json(
            { error: 'OTP code has expired. Please request a new one.' },
            { status: 400 },
          )
        }
      }

      // Check if max attempts reached
      const recentRecords = await payload.find({
        collection: 'otps',
        where: {
          and: [
            {
              or: [
                ...(email ? [{ email: { equals: email } }] : []),
                ...(phone ? [{ phone: { equals: phone } }] : []),
              ],
            },
            { type: { equals: type } },
            { createdAt: { greater_than: new Date(Date.now() - 15 * 60 * 1000).toISOString() } }, // Last 15 minutes
          ],
        },
        limit: 1,
        sort: '-createdAt',
      })

      if (recentRecords.docs.length > 0) {
        const recentRecord = recentRecords.docs[0]
        if (recentRecord.attempts >= 5) {
          return NextResponse.json(
            { error: 'Too many failed attempts. Please request a new OTP.' },
            { status: 429 },
          )
        }
      }

      return NextResponse.json(
        { error: 'Invalid OTP code. Please check and try again.' },
        { status: 400 },
      )
    }

    const otpRecord = otpRecords.docs[0]

    // Check if max attempts reached
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 429 },
      )
    }

    // Verify the OTP
    await payload.update({
      collection: 'otps',
      id: otpRecord.id,
      data: {
        isVerified: true,
        attempts: otpRecord.attempts + 1,
      },
    })

    // Clean up other unverified OTPs for this email/phone
    await payload.delete({
      collection: 'otps',
      where: {
        and: [
          {
            or: [
              ...(email ? [{ email: { equals: email } }] : []),
              ...(phone ? [{ phone: { equals: phone } }] : []),
            ],
          },
          { type: { equals: type } },
          { isVerified: { equals: false } },
          { id: { not_equals: otpRecord.id } },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      verifiedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP. Please try again.' }, { status: 500 })
  }
}
