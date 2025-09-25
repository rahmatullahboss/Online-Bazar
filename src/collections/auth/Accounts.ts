import { CollectionConfig } from 'payload'
import { withAccountCollection } from 'payload-auth-plugin/collection'

export const Accounts: CollectionConfig = withAccountCollection(
  {
    slug: 'accounts',
    admin: {
      defaultColumns: ['provider', 'providerAccountId'],
      useAsTitle: 'providerAccountId', // Now that we've added the field, we can use it as title
    },
    fields: [
      // Add the missing provider fields
      {
        name: 'provider',
        type: 'text',
        required: true,
      },
      {
        name: 'providerAccountId',
        type: 'text',
        required: true,
        unique: true,
      },
      // Add any additional fields you want for accounts here
    ],
    timestamps: true,
  },
  'users' // Use string instead of importing Users to avoid circular dependency
)