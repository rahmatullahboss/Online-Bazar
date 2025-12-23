import type { CollectionConfig } from 'payload'
import { admins, adminsOnly, anyone } from './access'

export const Offers: CollectionConfig = {
  slug: 'offers',
  labels: {
    singular: 'Offer',
    plural: 'Offers',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'type',
      'discountValue',
      'startDate',
      'endDate',
      'isActive',
      'usedCount',
    ],
    group: 'Marketing',
  },
  access: {
    read: anyone, // Public can see active offers
    create: admins,
    update: admins,
    delete: admins,
    admin: adminsOnly,
  },
  timestamps: true,
  fields: [
    // ============ BASIC INFO ============
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Offer title (e.g., "Flash Sale - 50% Off Electronics")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Detailed offer description shown to customers',
        rows: 3,
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: '⚡ Flash Sale', value: 'flash_sale' },
        { label: '🏷️ Category Sale', value: 'category_sale' },
        { label: '🎁 Buy X Get Y Free', value: 'buy_x_get_y' },
        { label: '📦 Bundle Deal', value: 'bundle' },
        { label: '🚚 Free Shipping', value: 'free_shipping' },
        { label: '🖼️ Promo Banner', value: 'promo_banner' },
      ],
      defaultValue: 'flash_sale',
      admin: {
        description: 'Type of offer/promotion',
      },
    },

    // ============ DISCOUNT SETTINGS ============
    {
      type: 'row',
      fields: [
        {
          name: 'discountType',
          type: 'select',
          required: true,
          options: [
            { label: 'Percentage Off', value: 'percent' },
            { label: 'Fixed Amount Off', value: 'fixed' },
            { label: 'Free Item', value: 'free_item' },
          ],
          defaultValue: 'percent',
          admin: {
            width: '50%',
            condition: (data) => data?.type !== 'promo_banner' && data?.type !== 'free_shipping',
          },
        },
        {
          name: 'discountValue',
          type: 'number',
          required: false,
          min: 0,
          admin: {
            width: '50%',
            description: 'Discount percentage (0-100) or fixed amount in taka',
            condition: (data) => data?.type !== 'promo_banner' && data?.type !== 'free_shipping',
          },
        },
      ],
    },

    // ============ SCHEDULING ============
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            description: 'When the offer starts',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            description: 'When the offer ends',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },

    // ============ STATUS ============
    {
      type: 'row',
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '33%',
            description: 'Manually enable/disable this offer',
          },
        },
        {
          name: 'displayOnHomepage',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '33%',
            description: 'Show in homepage offers section',
          },
        },
        {
          name: 'priority',
          type: 'number',
          defaultValue: 0,
          min: 0,
          max: 100,
          admin: {
            width: '33%',
            description: 'Higher priority offers take precedence (0-100)',
          },
        },
      ],
    },

    // ============ TARGETING ============
    {
      name: 'targetType',
      type: 'select',
      required: true,
      options: [
        { label: 'All Products', value: 'all' },
        { label: 'Specific Products', value: 'specific_products' },
        { label: 'Category', value: 'category' },
      ],
      defaultValue: 'all',
      admin: {
        description: 'What products does this offer apply to?',
        condition: (data) => data?.type !== 'promo_banner',
      },
    },
    {
      name: 'targetProducts',
      type: 'relationship',
      relationTo: 'items',
      hasMany: true,
      admin: {
        description: 'Select products this offer applies to',
        condition: (data) => data?.targetType === 'specific_products',
      },
    },
    {
      name: 'targetCategory',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        description: 'Select category this offer applies to',
        condition: (data) => data?.targetType === 'category',
      },
    },

    // ============ BOGO SETTINGS ============
    {
      name: 'bogoSettings',
      type: 'group',
      label: 'Buy X Get Y Settings',
      admin: {
        condition: (data) => data?.type === 'buy_x_get_y',
        description: 'Configure buy X get Y free/discounted offer',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'buyQuantity',
              type: 'number',
              required: false,
              min: 1,
              defaultValue: 1,
              admin: {
                width: '50%',
                description: 'Customer must buy this many',
              },
            },
            {
              name: 'getQuantity',
              type: 'number',
              required: false,
              min: 1,
              defaultValue: 1,
              admin: {
                width: '50%',
                description: 'Customer gets this many free/discounted',
              },
            },
          ],
        },
        {
          name: 'buyProduct',
          type: 'relationship',
          relationTo: 'items',
          hasMany: false,
          admin: {
            description: 'Product customer must buy (leave empty if same as target products)',
          },
        },
        {
          name: 'getProduct',
          type: 'relationship',
          relationTo: 'items',
          hasMany: false,
          admin: {
            description: 'Product customer gets free/discounted (leave empty for same product)',
          },
        },
        {
          name: 'getDiscountPercent',
          type: 'number',
          required: false,
          min: 0,
          max: 100,
          defaultValue: 100,
          admin: {
            description: 'Discount on the "get" product (100% = free, 50% = half price)',
          },
        },
      ],
    },

    // ============ BUNDLE SETTINGS ============
    {
      name: 'bundleProducts',
      type: 'relationship',
      relationTo: 'items',
      hasMany: true,
      admin: {
        description: 'Products included in this bundle',
        condition: (data) => data?.type === 'bundle',
      },
    },
    {
      name: 'bundlePrice',
      type: 'number',
      required: false,
      min: 0,
      admin: {
        description: 'Special bundle price (total for all items)',
        condition: (data) => data?.type === 'bundle',
      },
    },

    // ============ PROMO BANNER SETTINGS ============
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Banner image (recommended: 1200x400px)',
        condition: (data) => data?.type === 'promo_banner',
      },
    },
    {
      name: 'bannerLink',
      type: 'text',
      admin: {
        description: 'URL to navigate when banner is clicked',
        condition: (data) => data?.type === 'promo_banner',
      },
    },
    {
      name: 'bannerText',
      type: 'text',
      admin: {
        description: 'Text overlay on banner (optional)',
        condition: (data) => data?.type === 'promo_banner',
      },
    },

    // ============ LIMITS ============
    {
      name: 'minOrderValue',
      type: 'number',
      required: false,
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Minimum cart value to apply this offer (0 for no minimum)',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'usageLimit',
          type: 'number',
          required: false,
          min: 0,
          defaultValue: 0,
          admin: {
            width: '50%',
            description: 'Maximum redemptions (0 for unlimited)',
          },
        },
        {
          name: 'usedCount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            width: '50%',
            readOnly: true,
            description: 'Number of times used (auto-updated)',
          },
        },
      ],
    },

    // ============ DISPLAY ============
    {
      name: 'badge',
      type: 'text',
      required: false,
      admin: {
        description: 'Short badge text shown on products (e.g., "50% OFF", "BOGO")',
      },
    },
    {
      name: 'highlightColor',
      type: 'select',
      options: [
        { label: '🔴 Red', value: 'red' },
        { label: '🟠 Orange', value: 'orange' },
        { label: '🟡 Yellow', value: 'yellow' },
        { label: '🟢 Green', value: 'green' },
        { label: '🔵 Blue', value: 'blue' },
        { label: '🟣 Purple', value: 'purple' },
      ],
      defaultValue: 'red',
      admin: {
        description: 'Highlight color for badges and banners',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-generate badge if not provided
        if (!data?.badge && data?.discountType && data?.discountValue) {
          if (data.discountType === 'percent') {
            data.badge = `${data.discountValue}% OFF`
          } else if (data.discountType === 'fixed') {
            data.badge = `৳${data.discountValue} OFF`
          } else if (data.discountType === 'free_item') {
            data.badge = 'FREE ITEM'
          }
        }

        // Auto-set badge for BOGO
        if (data?.type === 'buy_x_get_y' && !data?.badge) {
          const buy = data.bogoSettings?.buyQuantity || 1
          const get = data.bogoSettings?.getQuantity || 1
          const discountPercent = data.bogoSettings?.getDiscountPercent ?? 100
          if (discountPercent === 100) {
            data.badge = `Buy ${buy} Get ${get} FREE`
          } else {
            data.badge = `Buy ${buy} Get ${get} @ ${discountPercent}% OFF`
          }
        }

        // Auto-set badge for free shipping
        if (data?.type === 'free_shipping' && !data?.badge) {
          data.badge = 'FREE SHIPPING'
        }

        return data
      },
    ],
  },
}
