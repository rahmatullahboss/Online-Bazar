import React from 'react'
import { Button } from '@/components/ui/button'

export const GoogleSignInButton = () => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
  // The plugin name 'frontend-auth' is defined in `payload.config.ts`
  const googleLoginUrl = `${serverUrl}/api/frontend-auth/oauth/google/authorize`

  return (
    <a href={googleLoginUrl}>
      <Button variant="outline" className="w-full">
        {/* আপনি এখানে গুগলের আইকনও ব্যবহার করতে পারেন */}
        Sign In with Google
      </Button>
    </a>
  )
}