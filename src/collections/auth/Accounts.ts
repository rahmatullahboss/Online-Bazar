import { CollectionConfig } from 'payload'
import { withAccountCollection } from 'payload-auth-plugin/collection'
import { Users } from '@/collections/Users'

export const Accounts: CollectionConfig = withAccountCollection(
  {
    slug: 'accounts',
    admin: {
      defaultColumns: ['provider', 'providerAccountId'],
      useAsTitle: 'providerAccountId',
    },
    fields: [
      // Add any additional fields you want for accounts here
    ],
    timestamps: true,
  },
  Users.slug
)