'use client'

import React from 'react'
import { useStackApp } from '@stackframe/stack'

export function StackLogoutButton() {
  const app = useStackApp()
  
  const handleLogout = async () => {
    // Use the signOut method from the app instance
    await (app as any).signOut()
    // Refresh the page to update the UI
    window.location.reload()
  }
  
  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Sign out
    </button>
  )
}