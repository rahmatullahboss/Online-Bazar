'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
}

export const useSession = () => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setIsLoggedIn(true)
        } else {
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('Failed to check session:', error)
        setUser(null)
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return { user, loading, isLoggedIn }
}