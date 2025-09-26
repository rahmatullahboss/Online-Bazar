"use client";

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function GoogleSignInButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isSubmitting}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      {isSubmitting ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
}