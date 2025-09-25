import type { CollectionConfig } from 'payload'
import { withUsersCollection } from 'payload-auth-plugin/collection'
import { deleteLinkedAccounts } from 'payload-auth-plugin/collection/hooks'
import { adminsOrSelf, anyone, checkRole } from './access'
import { Accounts } from './Accounts'

export const Users: CollectionConfig = withUsersCollection({
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: (data) => {
        const resetPasswordURL = `${data?.req?.payload.config.serverURL}/reset-password?token=${data?.token}`

        return `
          <!doctype html>
          <html>
            <body>
            You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process: ${resetPasswordURL} If you did not request this, please ignore this email and your password will remain unchanged.
              
            </body>
          </html>
        `
      },
    },
  },
  hooks: {
    afterDelete: [deleteLinkedAccounts(Accounts.slug)],
  },
  access: {
    create: anyone, // Allow anyone to create a user account (for registration)
    read: adminsOrSelf, // Allow users to read their own profile, admins can read all
    update: adminsOrSelf, // Allow users to update their own profile, admins can update all
    admin: ({ req: { user } }) => checkRole(['admin'], user),
  },
  fields: [
    {
      name: 'customerNumber',
      type: 'text',
      label: 'Customer number',
      required: false,
      admin: {
        description: 'Primary contact number for orders and updates',
      },
    },
    {
      name: 'deliveryZone',
      type: 'select',
      options: [
        { label: 'Inside Dhaka', value: 'inside_dhaka' },
        { label: 'Outside Dhaka', value: 'outside_dhaka' },
      ],
      required: true,
      defaultValue: 'inside_dhaka',
      admin: {
        description: 'Used to compute delivery charges automatically.',
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      defaultValue: 'user',
      required: true,
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    // Email added by default
    // Add more fields as needed
    {
      name: 'address',
      type: 'group',
      admin: {
        description: 'Shipping address used for orders',
      },
      fields: [
        {
          name: 'line1',
          type: 'text',
          label: 'Address line 1',
          required: false,
        },
        {
          name: 'line2',
          type: 'text',
          label: 'Address line 2',
          required: false,
        },
        {
          name: 'city',
          type: 'text',
          required: false,
        },
        {
          name: 'state',
          type: 'text',
          required: false,
        },
        {
          name: 'postalCode',
          type: 'text',
          label: 'Postal code',
          required: false,
        },
        {
          name: 'country',
          type: 'text',
          required: false,
        },
      ],
    },
  ],
})

