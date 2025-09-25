'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { frontendAuthClient } from '@/lib/auth'

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await frontendAuthClient.signout({ returnTo: '/' })
      // The signout function will handle redirection.
      // We can still dispatch an event if other parts of the app need to react instantly.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dyad-auth-changed'))
      }
    } catch (error) {
      console.error('An error occurred during logout', error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="hover:bg-gray-100 text-gray-700"
      onClick={handleLogout}
    >
      Logout
    </Button>
  )
}