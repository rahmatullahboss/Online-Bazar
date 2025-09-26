import React from 'react'
import { Button } from '@/components/ui/button'

export const GoogleSignInButton = () => {
  // Use a relative path to avoid CORS issues between preview and production domains.
  // The request will now go to the same domain the frontend is hosted on.
  const googleLoginUrl = '/api/frontend-auth/oauth/google/authorize'

  return (
    <a href={googleLoginUrl}>
      <Button variant="outline" className="w-full">
        {/* আপনি এখানে গুগলের আইকনও ব্যবহার করতে পারেন */}
        Sign In with Google
      </Button>
    </a>
  )
}