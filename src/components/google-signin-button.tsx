'use client'

import { Button } from '@/components/ui/button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const GoogleSignInButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Handle the OAuth callback
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      console.error('OAuth error:', error)
      // Handle error display to user
    }
  }, [searchParams])

  const handleGoogleSignIn = () => {
    // Redirect to the OAuth endpoint
    const redirectUrl = `/api/auth/google`
    window.location.href = redirectUrl
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={handleGoogleSignIn} 
          variant="outline" 
          className="w-full"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  )
}