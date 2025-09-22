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
