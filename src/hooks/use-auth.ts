'use client'

import { useEffect, useState } from 'react'
import { frontendAuthClient } from '@/lib/auth'
import type { User } from '@/payload-types'

// Type guard to check if the session data has a user property
// This helps TypeScript understand the shape of the data object.
function sessionDataHasUser(data: unknown): data is { user: User | null } {
  return typeof data === 'object' && data !== null && 'user' in data
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const session = await frontendAuthClient.getClientSession()

        if (session.isSuccess && sessionDataHasUser(session.data)) {
          setUser(session.data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()

    const handleAuthChange = () => {
      fetchUser()
    }

    // Listen for custom auth events that might be dispatched on login/logout
    window.addEventListener('dyad-auth-changed', handleAuthChange)

    return () => {
      window.removeEventListener('dyad-auth-changed', handleAuthChange)
    }
  }, [])

  return { user, isLoading }
}