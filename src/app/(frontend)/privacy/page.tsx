import React from 'react'

import { SiteHeader } from '@/components/site-header'
import { ContactEmailLink } from '@/components/contact-email-link'

export const metadata = {
  title: 'Privacy Policy — Online Bazar',
  description:
    'Experience the future of shopping with our curated collection of premium items, delivered with precision and passion.',
}

// Static generation for improved performance on this mostly immutable page
export const dynamic = 'force-static'

export default function PrivacyPage() {
  const updated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" />
      <div className="container mx-auto px-4 py-12 prose prose-gray max-w-3xl">
        <h1 className="brand-text text-4xl font-extrabold">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {updated}</p>

        <p>
          At Online Bazar, we respect your privacy. This policy explains what information we
          collect, how we use it, and the choices you have.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>Account details such as name, email, and phone number</li>
          <li>Shipping address and order history</li>
          <li>Payment and transaction details processed via secure providers</li>
          <li>Usage data like pages visited and interactions to improve our service</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Process and deliver your orders</li>
          <li>Provide customer support and notifications</li>
          <li>Personalize content and improve our store</li>
          <li>Detect, prevent, or address security and technical issues</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use cookies and similar technologies to keep you signed in, remember cart items, and
          analyze site performance. You can control cookies through your browser settings.
        </p>

        <h2>Sharing</h2>
        <p>
          We do not sell your personal data. We may share information with trusted providers (e.g.,
          payment and delivery partners) to fulfill orders and operate our services.
        </p>

        <h2>Data Security</h2>
        <p>
          We use reasonable administrative and technical safeguards to protect your data. No method
          of transmission is 100% secure; we strive to protect your information but cannot guarantee
          absolute security.
        </p>

        <h2>Your Choices</h2>
        <ul>
          <li>Access and update your profile from the “My Profile” page</li>
          <li>Contact us to request deletion or correction subject to legal obligations</li>
          <li>Opt out of non-essential emails by using unsubscribe links</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          Email: <ContactEmailLink className="hover:text-emerald-600" />{' '}
          <noscript>
            <span className="text-gray-600">rahmatullahzisan [at] gmail [dot] com</span>
          </noscript>
          <br />
          Phone: <a href="tel:01739416661">01739-416661</a>
          <br />
          Facebook:{' '}
          <a href="https://www.facebook.com/onlinebazarbarguna" target="_blank" rel="noreferrer">
            @onlinebazarbarguna
          </a>
        </p>
      </div>
    </div>
  )
}
