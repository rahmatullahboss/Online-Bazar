import type { CollectionConfig } from 'payload'
import { adminsOrSelf, anyone, checkRole } from './access'

export const ProgramParticipants: CollectionConfig = {
  slug: 'program-participants',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: anyone, // Allow anyone to register for the program
    read: adminsOrSelf, // Only admins can read all participants
    update: adminsOrSelf, // Only admins can update participant info
    admin: ({ req: { user } }) => checkRole(['admin'], user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone Number',
      maxLength: 11,
      minLength: 11,
      admin: {
        description: '11-digit phone number',
      },
    },
    // Note: createdAt and updatedAt fields are automatically added by Payload CMS
  ],
}

export default ProgramParticipants
