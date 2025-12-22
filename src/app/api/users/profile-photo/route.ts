import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import sharp from 'sharp'

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

    // Optimize image using Sharp - resize to max 400x400 and convert to webp
    const optimizedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Generate optimized filename
    const optimizedFileName = file.name.replace(/\.[^.]+$/, '') + '.webp'

    // Upload to media collection
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Profile photo for ${user.email}`,
      },
      file: {
        data: optimizedBuffer,
        mimetype: 'image/webp',
        name: optimizedFileName,
        size: optimizedBuffer.length,
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
