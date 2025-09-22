import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })

    const body = await request.json()
    const { name, phone } = body

    // Validate input
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 })
    }

    // Validate phone number format
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      return NextResponse.json({ error: 'Phone number must be exactly 11 digits' }, { status: 400 })
    }

    // Check if participant already exists
    const existingParticipants = await payload.find({
      collection: 'program-participants',
      where: {
        phone: {
          equals: phone,
        },
      },
    })

    if (existingParticipants.docs.length > 0) {
      return NextResponse.json(
        { error: 'A participant with this phone number is already registered' },
        { status: 400 },
      )
    }

    // Create new participant
    const newParticipant = await payload.create({
      collection: 'program-participants',
      data: {
        name,
        phone,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        participant: newParticipant,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error registering participant:', error)
    return NextResponse.json({ error: 'Failed to register participant' }, { status: 500 })
  }
}
