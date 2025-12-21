import type { CollectionConfig } from 'payload'
import { admins, adminsOnly, anyone } from './access'

export const Items: CollectionConfig = {
  slug: 'items',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'stock', 'available', 'category'],
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
    admin: adminsOnly,
  },
  fields: [
    // ============ BASIC INFO ============
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sku',
      type: 'text',
      required: false,
      unique: true,
      index: true,
      admin: {
        description: 'Unique product SKU/barcode for inventory tracking',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Shown on product highlights and cards.',
        rows: 3,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Main product copy displayed on the item page.',
        rows: 8,
      },
    },

    // ============ PRICING ============
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '50%',
            description: 'Current selling price',
          },
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          required: false,
          min: 0,
          admin: {
            width: '50%',
            description: 'Original price (for showing discounts)',
          },
        },
      ],
    },

    // ============ INVENTORY MANAGEMENT ============
    {
      name: 'inventoryManagement',
      type: 'group',
      label: 'Inventory Management',
      admin: {
        description: 'Track and manage product stock levels',
      },
      fields: [
        {
          name: 'trackInventory',
          type: 'checkbox',
          defaultValue: true,
          label: 'Track inventory',
          admin: {
            description: 'Enable stock tracking for this product',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'stock',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 0,
              admin: {
                width: '33%',
                description: 'Current stock quantity',
              },
            },
            {
              name: 'lowStockThreshold',
              type: 'number',
              required: false,
              min: 0,
              defaultValue: 5,
              admin: {
                width: '33%',
                description: 'Alert when stock falls below this',
              },
            },
            {
              name: 'reservedStock',
              type: 'number',
              required: false,
              min: 0,
              defaultValue: 0,
              admin: {
                width: '33%',
                description: 'Stock reserved for pending orders',
                readOnly: true,
              },
            },
          ],
        },
        {
          name: 'allowBackorders',
          type: 'checkbox',
          defaultValue: false,
          label: 'Allow backorders',
          admin: {
            description: 'Allow orders even when out of stock',
          },
        },
      ],
    },

    // ============ IMAGES ============
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Primary product image',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Image Gallery',
      admin: {
        description: 'Additional product images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          required: false,
          admin: {
            description: 'Alt text for accessibility',
          },
        },
      ],
    },
    {
      name: 'imageUrl',
      type: 'text',
      required: false,
      admin: {
        description:
          'Use this for placeholder images or external image URLs. Either image or imageUrl should be provided.',
      },
    },

    // ============ VARIANTS ============
    {
      name: 'hasVariants',
      type: 'checkbox',
      defaultValue: false,
      label: 'This product has variants',
      admin: {
        description: 'Enable if product comes in different sizes, colors, etc.',
      },
    },
    {
      name: 'variants',
      type: 'array',
      label: 'Product Variants',
      admin: {
        condition: (data) => data?.hasVariants === true,
        description: 'Add different sizes, colors, or other variations',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
                description: 'e.g., "Small - Red", "Large - Blue"',
              },
            },
            {
              name: 'sku',
              type: 'text',
              required: false,
              admin: {
                width: '50%',
                description: 'Variant-specific SKU',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'size',
              type: 'select',
              required: false,
              options: [
                { label: 'XS', value: 'xs' },
                { label: 'S', value: 's' },
                { label: 'M', value: 'm' },
                { label: 'L', value: 'l' },
                { label: 'XL', value: 'xl' },
                { label: 'XXL', value: 'xxl' },
                { label: 'Free Size', value: 'free' },
              ],
              admin: { width: '33%' },
            },
            {
              name: 'color',
              type: 'text',
              required: false,
              admin: {
                width: '33%',
                description: 'e.g., Red, Blue, #FF0000',
              },
            },
            {
              name: 'weight',
              type: 'text',
              required: false,
              admin: {
                width: '33%',
                description: 'e.g., 250g, 500g, 1kg',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'price',
              type: 'number',
              required: false,
              min: 0,
              admin: {
                width: '33%',
                description: 'Override base price (optional)',
              },
            },
            {
              name: 'stock',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 0,
              admin: {
                width: '33%',
                description: 'Stock for this variant',
              },
            },
            {
              name: 'available',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '33%' },
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Variant-specific image (optional)',
          },
        },
      ],
    },

    // ============ PRODUCT STATUS ============
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Product is available for purchase',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this product in featured sections',
      },
    },

    // ============ CATEGORIZATION ============
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: false,
      hasMany: false,
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Tags for search and filtering (comma-separated)',
      },
    },

    // ============ RELATED PRODUCTS ============
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'items',
      hasMany: true,
      admin: {
        description: 'Products to show in "You may also like" section',
      },
    },

    // ============ SHIPPING INFO ============
    {
      name: 'shipping',
      type: 'group',
      label: 'Shipping Information',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'weight',
              type: 'number',
              required: false,
              min: 0,
              admin: {
                width: '50%',
                description: 'Weight in grams',
              },
            },
            {
              name: 'freeShipping',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                width: '50%',
                description: 'This product ships free',
              },
            },
          ],
        },
        {
          name: 'dimensions',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'length',
                  type: 'number',
                  required: false,
                  min: 0,
                  admin: { width: '33%', description: 'Length in cm' },
                },
                {
                  name: 'width',
                  type: 'number',
                  required: false,
                  min: 0,
                  admin: { width: '33%', description: 'Width in cm' },
                },
                {
                  name: 'height',
                  type: 'number',
                  required: false,
                  min: 0,
                  admin: { width: '33%', description: 'Height in cm' },
                },
              ],
            },
          ],
        },
      ],
    },

    // ============ SEO ============
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      admin: {
        description: 'Search engine optimization settings',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: false,
          admin: {
            description: 'SEO title (defaults to product name if empty)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Meta description for search engines',
            rows: 3,
          },
        },
        {
          name: 'slug',
          type: 'text',
          required: false,
          unique: true,
          index: true,
          admin: {
            description: 'URL-friendly slug (auto-generated if empty)',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-generate slug if not provided
        if (operation === 'create' || !data?.seo?.slug) {
          if (data?.name && (!data?.seo?.slug || data.seo.slug === '')) {
            const slug = data.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()
            data.seo = { ...data.seo, slug }
          }
        }

        // Auto-update availability based on stock
        if (data?.inventoryManagement?.trackInventory) {
          const stock = data?.inventoryManagement?.stock ?? 0
          const allowBackorders = data?.inventoryManagement?.allowBackorders ?? false
          if (stock <= 0 && !allowBackorders) {
            data.available = false
          }
        }

        return data
      },
    ],
  },
}
