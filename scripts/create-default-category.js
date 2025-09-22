import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createDefaultCategory() {
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
      console.log('Default "General" category already exists')
      return
    }

    // Create the default "General" category
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'General',
        description: 'General items',
      },
    })

    console.log('Created default category:', category)
  } catch (error) {
    console.error('Error creating default category:', error)
  }
}

createDefaultCategory()
