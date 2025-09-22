import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Check if "General" category already exists
    const existingCategories = await payload.find({
      collection: 'categories',
      where: {
        name: {
          equals: 'General',
        },
      },
    })

    if (existingCategories.docs.length > 0) {
      return Response.json({
        message: 'Default "General" category already exists',
        category: existingCategories.docs[0],
      })
    }

    // Create the default "General" category
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'General',
        description: 'General items',
      },
    })

    return Response.json({ message: 'Created default category', category })
  } catch (error: any) {
    console.error('Error creating default category:', error)
    return Response.json(
      { error: 'Failed to create default category', details: error.message },
      { status: 500 },
    )
  }
}
