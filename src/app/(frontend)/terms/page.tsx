import React from 'react'

import { SiteHeader } from '@/components/site-header'
import { ContactEmailLink } from '@/components/contact-email-link'
import { SITE_NAME, CONTACT_PHONE, SOCIAL_FACEBOOK } from '@/lib/site-config'

export const metadata = {
  title: `Terms & Conditions — ${SITE_NAME}`,
  description: 'Terms and conditions for using our e-commerce platform and services.',
}

// Static generation for improved performance
export const dynamic = 'force-static'

export default function TermsPage() {
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
        <h1 className="brand-text text-4xl font-extrabold">Terms & Conditions</h1>
        <p className="text-sm text-gray-500">Last updated: {updated}</p>

        <p>
          Welcome to {SITE_NAME}! By accessing or using our website and services, you agree to be
          bound by these Terms & Conditions. Please read them carefully.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By placing an order or creating an account, you confirm that you accept these terms and
          agree to comply with them. If you do not agree, please do not use our services.
        </p>

        <h2>2. Account Registration</h2>
        <ul>
          <li>You must provide accurate and complete information when creating an account</li>
          <li>You are responsible for maintaining the security of your account credentials</li>
          <li>You must be at least 18 years old to place an order</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
        </ul>

        <h2>3. Products & Pricing</h2>
        <ul>
          <li>All prices are displayed in Bangladeshi Taka (BDT)</li>
          <li>Prices may change without prior notice</li>
          <li>Product images are for illustration purposes; actual products may vary slightly</li>
          <li>We reserve the right to limit quantities and refuse orders</li>
        </ul>

        <h2>4. Orders & Payment</h2>
        <ul>
          <li>Orders are confirmed only after successful payment verification</li>
          <li>We accept Cash on Delivery (COD) and online payment methods</li>
          <li>For COD orders, payment is collected upon delivery</li>
          <li>We reserve the right to cancel orders due to pricing errors or stock issues</li>
        </ul>

        <h2>5. Delivery</h2>
        <ul>
          <li>Delivery times are estimates and may vary based on location</li>
          <li>We are not responsible for delays caused by third-party couriers</li>
          <li>You must ensure someone is available to receive the delivery</li>
          <li>Delivery charges are shown at checkout before order confirmation</li>
        </ul>

        <h2>6. Returns & Refunds</h2>
        <ul>
          <li>Defective or damaged items may be returned within 3 days of delivery</li>
          <li>Items must be unused and in original packaging for returns</li>
          <li>Refunds are processed within 7-14 business days after receiving returned items</li>
          <li>Some items may not be eligible for return (e.g., perishables, personalized items)</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          All content on this website, including text, images, logos, and graphics, is the property
          of {SITE_NAME} and protected by copyright laws. Unauthorized use is prohibited.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {SITE_NAME} shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of our services.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of our services after changes
          constitutes acceptance of the modified terms.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          Email: <ContactEmailLink className="hover:text-emerald-600" />{' '}
          <noscript>
            <span className="text-gray-600">rahmatullahzisan [at] gmail [dot] com</span>
          </noscript>
          <br />
          Phone: <a href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, '')}`}>{CONTACT_PHONE}</a>
          <br />
          {SOCIAL_FACEBOOK && (
            <>
              Facebook:{' '}
              <a href={SOCIAL_FACEBOOK} target="_blank" rel="noreferrer">
                Facebook Page
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
