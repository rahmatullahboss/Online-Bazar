/**
 * Store Configuration
 * ===================
 * This file contains all the branding and store information.
 * Update this file to customize the store for your client.
 *
 * All hardcoded brand references in the codebase read from this config.
 */

export const storeConfig = {
  // Store Identity
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'Your Store Name',
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Quality Products, Best Prices',
  description:
    process.env.NEXT_PUBLIC_STORE_DESCRIPTION ||
    'Your one-stop shop for quality products at the best prices.',

  // Logo & Branding
  logo: {
    url: process.env.NEXT_PUBLIC_LOGO_URL || '/logo.png',
    alt: process.env.NEXT_PUBLIC_STORE_NAME || 'Store Logo',
    width: 120,
    height: 40,
  },
  favicon: '/favicon.ico',
  emoji: process.env.NEXT_PUBLIC_STORE_EMOJI || '🛍️', // Used as fallback icon

  // Contact Information
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@yourstore.com',
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+880 1XXX-XXXXXX',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '+8801XXXXXXXXX',
    address: process.env.NEXT_PUBLIC_ADDRESS || 'Dhaka, Bangladesh',
  },

  // Social Media Links
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || '',
  },

  // Business Information
  business: {
    currency: {
      code: 'BDT',
      symbol: '৳',
      name: 'Bangladeshi Taka',
    },
    country: 'Bangladesh',
    timezone: 'Asia/Dhaka',
    language: 'bn-BD', // Bengali
  },

  // SEO & Meta
  seo: {
    titleTemplate: '%s | ' + (process.env.NEXT_PUBLIC_STORE_NAME || 'Your Store'),
    defaultTitle: process.env.NEXT_PUBLIC_STORE_NAME || 'Your Store Name',
    keywords: ['ecommerce', 'online shopping', 'bangladesh', 'products', 'delivery'],
    ogImage: '/og-image.jpg',
  },

  // Payment Methods Available
  paymentMethods: {
    cod: {
      enabled: true,
      name: 'Cash on Delivery',
      nameBn: 'ক্যাশ অন ডেলিভারি',
    },
    bkash: {
      enabled: true,
      name: 'bKash',
      number: process.env.NEXT_PUBLIC_BKASH_NUMBER || '01XXXXXXXXX',
    },
    nagad: {
      enabled: true,
      name: 'Nagad',
      number: process.env.NEXT_PUBLIC_NAGAD_NUMBER || '01XXXXXXXXX',
    },
  },

  // Theme Colors (used to generate tailwind config)
  theme: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#d97706', // Amber-600
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#1e40af', // Blue-800
    accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#059669', // Emerald-600
  },

  // Feature Flags (enable/disable features)
  features: {
    reviews: true,
    wishlist: true,
    blog: true,
    guestCheckout: true,
    pushNotifications: true,
    abandonedCartRecovery: true,
    orderTracking: true,
    productVariants: true,
    inventory: true,
    coupons: true,
  },

  // Legal
  legal: {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company Ltd.',
    privacyPolicyUrl: '/privacy',
    termsUrl: '/terms',
    refundPolicyUrl: '/refund-policy',
  },
}

// Export helpers
export const getStoreName = () => storeConfig.name
export const getStoreEmail = () => storeConfig.contact.email
export const getStorePhone = () => storeConfig.contact.phone
export const getCurrency = () => storeConfig.business.currency.symbol

// Format price with currency
export const formatPrice = (amount: number): string => {
  return `${storeConfig.business.currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export default storeConfig
