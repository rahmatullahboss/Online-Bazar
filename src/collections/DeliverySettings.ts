import type { CollectionConfig } from 'payload'

import { admins, adminsOnly, anyone } from './access'

export const DeliverySettings: CollectionConfig = {
  slug: 'delivery-settings',
  labels: {
    singular: 'Delivery Setting',
    plural: 'Delivery Settings',
  },
  admin: {
    useAsTitle: 'label',
    description: 'Configure delivery charges and free delivery thresholds.',
    defaultColumns: ['label', 'insideDhakaCharge', 'outsideDhakaCharge', 'freeDeliveryThreshold'],
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
    admin: adminsOnly,
  },
  hooks: {
    beforeChange: [
      async ({ req, operation }) => {
        if (operation !== 'create') return
        const existing = await req.payload.find({ collection: 'delivery-settings', limit: 1 })
        if (existing.totalDocs > 0) {
          throw new Error('Only one delivery settings document is allowed. Please edit the existing entry.')
        }
      },
    ],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'Default Delivery Settings',
    },
    {
      name: 'insideDhakaCharge',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 80,
      label: 'Inside Dhaka delivery charge (BDT)',
    },
    {
      name: 'outsideDhakaCharge',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 120,
      label: 'Outside Dhaka delivery charge (BDT)',
    },
    {
      name: 'freeDeliveryThreshold',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 2000,
      label: 'Free delivery threshold (BDT)',
      admin: {
        description: 'Orders equal to or above this amount receive free delivery.',
      },
    },
    {
      name: 'digitalPaymentDeliveryCharge',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 20,
      label: 'Digital payment delivery charge (BDT)',
      admin: {
        description: 'Applied when the order total is below the free delivery threshold.',
      },
    },
    {
      name: 'shippingHighlightTitle',
      type: 'text',
      required: true,
      defaultValue: 'Free shipping on orders over 2000 taka',
      label: 'Shipping highlight title',
    },
    {
      name: 'shippingHighlightSubtitle',
      type: 'text',
      required: true,
      defaultValue: 'Digital wallet payments have a flat Tk 20 delivery charge.',
      label: 'Shipping highlight subtitle',
    },
  ],
}
