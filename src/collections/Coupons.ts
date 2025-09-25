import type { CollectionConfig } from 'payload'
import { admins, adminsOnly } from './access'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: {
    singular: 'Coupon',
    plural: 'Coupons',
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: [
      'code',
      'discountType',
      'discountValue',
      'expiryDate',
      'isActive',
      'usageLimit',
      'usedCount',
    ],
  },
  access: {
    read: adminsOnly,
    create: admins,
    update: admins,
    delete: admins,
    admin: adminsOnly,
  },
  timestamps: true,
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Unique coupon code (e.g., SAVE10)' },
    },
    {
      name: 'discountType',
      type: 'select',
      options: [
        { label: 'Percentage Off', value: 'percent' },
        { label: 'Fixed Amount Off', value: 'fixed' },
      ],
      defaultValue: 'percent',
      required: true,
    },
    {
      name: 'discountValue',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      admin: { description: 'Discount percentage (0-100 for percent) or fixed amount' },
    },
    {
      name: 'expiryDate',
      type: 'date',
      required: false,
      admin: { description: 'Optional expiry date' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      required: true,
      admin: { description: 'Whether the coupon is currently active' },
    },
    {
      name: 'usageLimit',
      type: 'number',
      required: false,
      min: 0,
      defaultValue: 0,
      admin: { description: 'Maximum number of uses (0 for unlimited)' },
    },
    {
      name: 'usedCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { readOnly: true, description: 'Number of times used (auto-updated)' },
    },
    {
      name: 'applicableTo',
      type: 'select',
      options: [
        { label: 'All Orders', value: 'all' },
        { label: 'First Order Only', value: 'first_order' },
      ],
      defaultValue: 'all',
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Increment usedCount when applied to an order
        if (doc.usedCount < doc.usageLimit || doc.usageLimit === 0) {
          // This would be called from order creation/update
        }
        return doc
      },
    ],
  },
}
