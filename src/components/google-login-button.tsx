'use client'

import React from 'react'
import { OAuthButton } from '@stackframe/stack'

interface GoogleLoginButtonProps {
  redirectTo?: string
}

export function GoogleLoginButton({ redirectTo = '/' }: GoogleLoginButtonProps) {
  return (
    <div className="w-full">
      <OAuthButton
        provider="google"
        type="sign-in"
      />
    </div>
  )
}
