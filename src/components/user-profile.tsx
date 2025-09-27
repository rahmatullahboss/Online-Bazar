'use client'

import React from 'react'
import { useUser } from '@stackframe/stack'

export function UserProfile() {
  const user = useUser()
  
  if (!user) {
    return null
  }
  
  return (
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
        {user.displayName?.charAt(0) || 'U'}
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-900">
          {user.displayName || 'User'}
        </p>
      </div>
    </div>
  )
}