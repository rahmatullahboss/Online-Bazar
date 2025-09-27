# Neon Auth Integration Guide

This document explains how to set up Google Sign-In using Neon Auth for the storefront while keeping the admin panel separate.

## Prerequisites

1. A Neon Database project with Neon Auth enabled
2. A Google Cloud project with OAuth credentials
3. Environment variables configured in your Vercel project

## Setup Steps

### 1. Enable Neon Auth in Neon Console

1. Go to your Neon project → Auth → "Enable Neon Auth"
2. In the Configuration tab, select Next.js as the framework
3. Note the required environment variables:
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY`
   - `DATABASE_URL` (your Neon connection string)

### 2. Set up Google OAuth Provider

1. In the Neon Auth dashboard, go to OAuth providers → Add → Google
2. In Google Cloud Console, create an OAuth client and get the Client ID/Secret
3. Paste these into the Neon Auth Google provider configuration
4. Set the callback URL to: `https://api.stack-auth.com/api/v1/auth/oauth/callback/google`
5. Add your domains to the whitelist:
   - `online-bazar.top` (production)
   - `localhost:3000` (development)

### 3. Configure Environment Variables

Add these environment variables to your Vercel project:

```bash
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SECRET_SERVER_KEY=your_secret_key
DATABASE_URL=your_neon_database_url
```

If you're using Vercel's managed integration, these will be auto-added.

### 4. Install Stack Auth Package

```bash
pnpm add @stackframe/stack
```

### 5. Add StackProvider to Root Layout

The integration automatically added a root layout at `src/app/layout.tsx`:

```tsx
import React from 'react'
import type { Metadata } from 'next'
import { StackProvider } from '@stackframe/stack'

export const metadata: Metadata = {
  title: 'Online Bazar',
  description: 'Experience the future of shopping with our curated collection of premium items.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StackProvider>
          {children}
        </StackProvider>
      </body>
    </html>
  )
}
```

### 6. Using Google Sign-In

The Google Sign-In button has been added to the login page (`/login`). Users can now sign in with their Google accounts.

Components used:
- `GoogleLoginButton` - Custom component that uses Stack Auth's OAuthButton
- `UserProfile` - Displays user information in the header
- `StackLogoutButton` - Handles user sign-out

### 7. User Data Synchronization

Neon Auth automatically syncs user data to the `neon_auth.users_sync` table in your database. You can join this with your existing orders table:

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  total_cents integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 8. Production Hardening

1. In Neon Auth → Configuration → Domains, whitelist only trusted domains
2. Use your own Google OAuth credentials instead of shared development keys
3. Ensure environment variables are properly set in production

### 9. Deployment

1. Make sure all 4 environment variables are set in your Vercel project
2. Deploy your application
3. Test the flow: `/login` → Google Sign-In → Redirect back to your app

## Admin Panel

The admin panel continues to use the existing Payload authentication system. Neon Auth is only used for storefront user authentication.

## Troubleshooting

1. If you see redirect issues, ensure both www and non-www versions of your domain are whitelisted
2. Don't block `/handler/*` or auth routes with middleware
3. Check that Google's authorized origins/branding is properly configured

## Why Neon Auth?

Vercel's "Vercel Authentication" is only for deployment access control, not for end-user login systems. For storefront authentication, you need a proper auth solution like Neon Auth, Auth0, or Clerk.