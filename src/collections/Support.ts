import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { adminsOrSelf } from './access'

const Support: CollectionConfig = {
  slug: 'support',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'user', 'status', 'createdAt'],
  },
  access: {
    read: adminsOrSelf,
    create: () => true,
    update: adminsOrSelf,
    delete: ({ req: { user } }: { req: { user: User | null } }) => !!user && user.role === 'admin',
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      maxLength: 200,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: false,
      admin: {
        condition: (siblingData: any) => !siblingData?.user,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
      access: {
        update: ({ req: { user } }: { req: { user: User | null } }) =>
          !!user && user.role === 'admin',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

export default Support