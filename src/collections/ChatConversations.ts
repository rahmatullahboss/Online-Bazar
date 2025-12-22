import type { CollectionConfig } from 'payload'
import { admins, adminsOnly } from './access'

export const ChatConversations: CollectionConfig = {
  slug: 'chat-conversations',
  admin: {
    useAsTitle: 'sessionId',
    defaultColumns: ['sessionId', 'user', 'messageCount', 'lastMessageAt', 'createdAt'],
    group: 'Customer Support',
  },
  access: {
    read: admins,
    create: () => true, // Allow API to create
    update: () => true, // Allow API to update
    delete: admins,
    admin: adminsOnly,
  },
  fields: [
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique session identifier for this conversation',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'Logged in user (if any)',
      },
    },
    {
      name: 'guestInfo',
      type: 'group',
      admin: {
        description: 'Guest customer info (for non-logged in users)',
        condition: (data) => !data?.user,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: false,
          admin: {
            description: 'Guest customer name',
          },
        },
        {
          name: 'phone',
          type: 'text',
          required: false,
          admin: {
            description: 'Guest customer phone number',
          },
        },
      ],
    },
    {
      name: 'messages',
      type: 'array',
      required: true,
      admin: {
        description: 'Chat messages in this conversation',
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'User', value: 'user' },
            { label: 'Assistant', value: 'assistant' },
          ],
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'messageCount',
      type: 'number',
      required: false,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total number of messages',
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      required: false,
      admin: {
        readOnly: true,
        description: 'When the last message was sent',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'metadata',
      type: 'group',
      admin: {
        description: 'Additional conversation metadata',
      },
      fields: [
        {
          name: 'userAgent',
          type: 'text',
          required: false,
        },
        {
          name: 'ipAddress',
          type: 'text',
          required: false,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-update message count and last message timestamp
        if (data?.messages) {
          data.messageCount = data.messages.length
          if (data.messages.length > 0) {
            const lastMessage = data.messages[data.messages.length - 1]
            data.lastMessageAt = lastMessage.timestamp || new Date().toISOString()
          }
        }
        return data
      },
    ],
  },
}
