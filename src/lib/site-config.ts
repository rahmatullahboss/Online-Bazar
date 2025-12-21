/**
 * Site Configuration for White-Label Support
 * All branding and contact info should come from environment variables
 */

// Site Branding
export const SITE_NAME =
  process.env.NEXT_PUBLIC_STORE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || 'Online Bazar'
export const SITE_TAGLINE =
  process.env.NEXT_PUBLIC_STORE_TAGLINE ||
  process.env.NEXT_PUBLIC_SITE_TAGLINE ||
  'Your one-stop shop'
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_STORE_DESCRIPTION ||
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  'Premium quality products delivered to your doorstep'
export const SITE_EMOJI = process.env.NEXT_PUBLIC_STORE_EMOJI || '🛍️'

// Contact Information
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '01739-416661'
export const CONTACT_PHONE_RAW = CONTACT_PHONE.replace(/[^0-9+]/g, '') // For tel: links
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@onlinebazar.com'
export const CONTACT_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || CONTACT_PHONE_RAW

// Payment Account Numbers (for bKash, Nagad etc.)
export const PAYMENT_BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || '01739-416661'
export const PAYMENT_NAGAD_NUMBER = process.env.NEXT_PUBLIC_NAGAD_NUMBER || '01739-416661'

// Social Media Links
export const SOCIAL_FACEBOOK = process.env.NEXT_PUBLIC_FACEBOOK_URL || ''
export const SOCIAL_INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_URL || ''
export const SOCIAL_YOUTUBE = process.env.NEXT_PUBLIC_YOUTUBE_URL || ''
export const SOCIAL_TWITTER = process.env.NEXT_PUBLIC_TWITTER_URL || ''
export const SOCIAL_TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_URL || ''

// Address
export const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_ADDRESS || 'Dhaka, Bangladesh'

// URLs
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Company info for legal
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || SITE_NAME

// Helper function to get site config object
export function getSiteConfig() {
  return {
    name: SITE_NAME,
    tagline: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    emoji: SITE_EMOJI,
    contact: {
      phone: CONTACT_PHONE,
      phoneRaw: CONTACT_PHONE_RAW,
      email: CONTACT_EMAIL,
      whatsapp: CONTACT_WHATSAPP,
    },
    payment: {
      bkash: PAYMENT_BKASH_NUMBER,
      nagad: PAYMENT_NAGAD_NUMBER,
    },
    social: {
      facebook: SOCIAL_FACEBOOK,
      instagram: SOCIAL_INSTAGRAM,
      youtube: SOCIAL_YOUTUBE,
      twitter: SOCIAL_TWITTER,
      tiktok: SOCIAL_TIKTOK,
    },
    address: BUSINESS_ADDRESS,
    url: SITE_URL,
    companyName: COMPANY_NAME,
  }
}

// Type for site config
export type SiteConfig = ReturnType<typeof getSiteConfig>
