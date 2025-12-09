import type { CollectionConfig } from 'payload'

export const PushSubscriptions: CollectionConfig = {
  slug: 'push-subscriptions',
  admin: {
    useAsTitle: 'endpoint',
    group: 'System',
    description: 'Browser push notification subscriptions',
  },
  access: {
    // Only admins can read subscriptions
    read: ({ req: { user } }) => user?.role === 'admin',
    // Users can create their own subscriptions
    create: ({ req: { user } }) => Boolean(user),
    // Users can update their own subscriptions
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    // Users can delete their own subscriptions
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        description: 'The user who owns this subscription',
      },
    },
    {
      name: 'endpoint',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Push service endpoint URL',
      },
    },
    {
      name: 'keys',
      type: 'group',
      admin: {
        description: 'Encryption keys for push notifications',
      },
      fields: [
        {
          name: 'p256dh',
          type: 'text',
          required: true,
          admin: {
            description: 'Public key for message encryption',
          },
        },
        {
          name: 'auth',
          type: 'text',
          required: true,
          admin: {
            description: 'Authentication secret',
          },
        },
      ],
    },
    {
      name: 'userAgent',
      type: 'text',
      required: false,
      admin: {
        description: 'Browser user agent for debugging',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this subscription is still active',
      },
    },
  ],
  timestamps: true,
}
