'use client'

import { Button } from '@/components/ui/button'

export const GoogleSignInButton = () => {
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