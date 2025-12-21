import React from 'react'
import Link from 'next/link'
import storeConfig from '@/config/store.config'

import { ContactEmailLink } from '@/components/contact-email-link'

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200/60 bg-gray-50/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">
          <div>
            <Link href="/" className="text-2xl font-semibold brand-text">
              {storeConfig.name}
            </Link>
            <p className="text-sm text-gray-600 mt-3 max-w-xs mx-auto sm:mx-0">
              {storeConfig.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-emerald-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-600">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-emerald-600">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/my-orders" className="hover:text-emerald-600">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-600">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                Phone:{' '}
                <a href={`tel:${storeConfig.contact.phone}`} className="hover:text-emerald-600">
                  {storeConfig.contact.phone}
                </a>
              </li>
              <li>
                Email: <ContactEmailLink className="hover:text-emerald-600" />
              </li>
              {storeConfig.social.facebook && (
                <li>
                  Facebook:{' '}
                  <a
                    href={storeConfig.social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-600"
                  >
                    Follow us
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center text-center sm:text-left sm:flex-row sm:justify-between gap-4">
          <p className="text-sm text-gray-600">
            Copyright {new Date().getFullYear()} © {storeConfig.name} — All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm">
            {storeConfig.social.facebook && (
              <a
                href={storeConfig.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-emerald-600"
              >
                Facebook
              </a>
            )}
            {storeConfig.social.instagram && (
              <a
                href={storeConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-emerald-600"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
