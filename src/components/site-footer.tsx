import React from 'react'
import Link from 'next/link'

import { ContactEmailLink } from '@/components/contact-email-link'

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200/60 bg-gray-50/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">
          <div>
            <Link href="/" className="text-2xl font-semibold brand-text">
              Online Bazar
            </Link>
            <p className="text-sm text-gray-600 mt-3 max-w-xs mx-auto sm:mx-0">
              Your destination for great products and a smooth shopping experience — all in one place.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Products</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-emerald-600">Earphones</Link></li>
              <li><Link href="/" className="hover:text-emerald-600">Headphones</Link></li>
              <li><Link href="/" className="hover:text-emerald-600">Smartphones</Link></li>
              <li><Link href="/" className="hover:text-emerald-600">Laptops</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Website</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-emerald-600">Home</Link></li>
              <li><Link href="/my-orders" className="hover:text-emerald-600">My Orders</Link></li>
              <li><Link href="/profile" className="hover:text-emerald-600">My Profile</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Phone: <a href="tel:01739416661" className="hover:text-emerald-600">01739-416661</a></li>
              <li>
                Email:{' '}
                <ContactEmailLink className="hover:text-emerald-600" />
                {' '}
                <noscript>
                  <span className="text-gray-600">rahmatullahzisan [at] gmail [dot] com</span>
                </noscript>
              </li>
              <li>Facebook: <a href="https://www.facebook.com/onlinebazarbarguna" target="_blank" rel="noreferrer" className="hover:text-emerald-600">@onlinebazarbarguna</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center text-center sm:text-left sm:flex-row sm:justify-between gap-4">
          <p className="text-sm text-gray-600">Copyright {new Date().getFullYear()} © Online Bazar — All rights reserved.</p>
          <div className="flex items-center gap-5 text-sm">
            <a href="https://www.facebook.com/onlinebazarbarguna" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-emerald-600">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
