import type { CollectionConfig } from 'payload'
import { authenticated, checkRole } from './access'

export const Wishlist: CollectionConfig = {
  slug: 'wishlists',
  labels: {
    singular: 'Wishlist',
    plural: 'Wishlists',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'itemCount', 'updatedAt'],
    description: 'User wishlists for saving favorite products',
  },
  access: {
    // Users can only read their own wishlist
    read: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole(['admin'], user as any)) return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    // Only authenticated users can create (one per user)
    create: authenticated,
    // Users can only update their own
    update: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole(['admin'], user as any)) return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    // Users can only delete their own
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole(['admin'], user as any)) return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
  },
  timestamps: true,
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'The user who owns this wishlist',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Wishlist Items',
      admin: {
        description: 'Products saved to wishlist',
      },
      fields: [
        {
          name: 'item',
          type: 'relationship',
          relationTo: 'items',
          required: true,
        },
        {
          name: 'addedAt',
          type: 'date',
          defaultValue: () => new Date(),
          admin: {
            readOnly: true,
            description: 'When this item was added to wishlist',
          },
        },
        {
          name: 'notifyOnSale',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Notify user when this item goes on sale',
          },
        },
        {
          name: 'notifyOnStock',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Notify user when this item is back in stock',
          },
        },
      ],
    },
    {
      name: 'itemCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of items in wishlist',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-update item count
        if (data?.items && Array.isArray(data.items)) {
          data.itemCount = data.items.length
        }
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req }) => {
        // Auto-set user from request if not provided
        if (req?.user && !data?.user) {
          ;(data as any).user = (req.user as any).id
        }
        return data
      },
    ],
  },
}
