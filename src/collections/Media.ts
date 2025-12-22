import type { CollectionConfig } from 'payload'
import { admins, adminsOnly, anyone } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
    admin: adminsOnly,
  },
  hooks: {
    beforeOperation: [
      async ({ req, operation }) => {
        // Only optimize on create or update when a file is present
        if ((operation === 'create' || operation === 'update') && req.file) {
          const file = req.file
          const mimeType = file.mimetype || ''

          // Only process image files (skip SVG as it's already optimized)
          if (mimeType.startsWith('image/') && !mimeType.includes('svg')) {
            try {
              // Dynamic import to avoid webpack bundling issues
              const sharp = (await import('sharp')).default

              // Get the file buffer
              const buffer = file.data as Buffer

              // Optimize image: resize to max 1200x1200 and convert to webp
              const optimizedBuffer = await sharp(buffer)
                .resize(1200, 1200, {
                  fit: 'inside',
                  withoutEnlargement: true,
                })
                .webp({ quality: 85 })
                .toBuffer()

              // Update file properties
              req.file.data = optimizedBuffer
              req.file.mimetype = 'image/webp'
              req.file.size = optimizedBuffer.length
              req.file.name = file.name.replace(/\.[^.]+$/, '') + '.webp'
            } catch (error) {
              console.error('Image optimization error:', error)
              // If optimization fails, continue with original file
            }
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional. Provide descriptive text for accessibility when available.',
      },
    },
  ],
  upload: true,
}
