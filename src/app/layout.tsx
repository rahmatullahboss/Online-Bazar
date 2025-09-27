import React from 'react'
import type { Metadata } from 'next'
import { StackProvider } from '@stackframe/stack'

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
        <StackProvider>
          {children}
        </StackProvider>
      </body>
    </html>
  )
}