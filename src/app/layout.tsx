import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Bazar',
  description: 'Experience the future of shopping with our curated collection of premium items.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}