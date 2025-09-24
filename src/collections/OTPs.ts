import type { CollectionConfig } from 'payload'
import { anyone } from './access'

export const OTPs: CollectionConfig = {
  slug: 'otps',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'code', 'isVerified', 'expiresAt', 'createdAt'],
  },
  access: {
    create: anyone,
    read: anyone,
    update: anyone,
    delete: anyone,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: false,
      index: true,
      validate: (value) => {
        if (value && !/^01[3-9]\d{8}$/.test(value)) {
          return 'Please enter a valid Bangladeshi phone number (01XXXXXXXXX)'
        }
        return true
      },
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      minLength: 6,
      maxLength: 6,
      validate: (value) => {
        if (!/^\d{6}$/.test(value)) {
          return 'OTP code must be exactly 6 digits'
        }
        return true
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Registration', value: 'registration' },
        { label: 'Login', value: 'login' },
        { label: 'Password Reset', value: 'password_reset' },
        { label: 'Phone Verification', value: 'phone_verification' },
      ],
      defaultValue: 'registration',
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 5,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data like IP address, user agent, etc.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-expire OTPs after 10 minutes
        if (!data.expiresAt) {
          data.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }
        return data
      },
    ],
  },
  timestamps: true,
}
