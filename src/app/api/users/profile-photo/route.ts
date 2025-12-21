import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to media collection
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Profile photo for ${user.email}`,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    })

    // Update user's profilePhoto
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        profilePhoto: media.id,
      },
    })

    return NextResponse.json({
      success: true,
      mediaId: media.id,
      url: (media as { url?: string }).url,
    })
  } catch (error) {
    console.error('Profile photo upload error:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove profile photo
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        profilePhoto: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile photo delete error:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
