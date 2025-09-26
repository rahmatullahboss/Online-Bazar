# Google OAuth Setup Instructions

## Step 1: Create a Google OAuth Client

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Application type: Web application
6. Name your OAuth client (e.g., "Online Bazar")
7. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (for development)
   - https://online-bazar.top/api/auth/callback/google (for production)
   - Add any other domains you're using (e.g., Vercel preview URLs)
8. Authorized JavaScript origins:
   - http://localhost:3000
   - https://online-bazar.top
   - Add any other domains you're using

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```
AUTH_GOOGLE_ID=your_actual_google_client_id_here
AUTH_GOOGLE_SECRET=your_actual_google_client_secret_here
AUTH_SECRET=your_auth_secret_here
ADMIN_EMAIL=rahmatullahzisan@gmail.com
```

Replace the placeholder values with your actual Google OAuth credentials:
- `AUTH_GOOGLE_ID` - Your Google OAuth client ID from the Google Cloud Console
- `AUTH_GOOGLE_SECRET` - Your Google OAuth client secret from the Google Cloud Console
- `AUTH_SECRET` - A random string used to encode JWT tokens (already provided in your file)
- `ADMIN_EMAIL` - The email address that should be granted admin access (set to your email)

## Step 3: Testing

1. Save your `.env.local` file
2. Restart your development server: `pnpm dev`
3. Navigate to the login page
4. Click the "Continue with Google" button
5. You should be redirected to Google's OAuth flow

Note: If you don't have an existing account, Google Sign-In will automatically create a new account for you. If you already have an account, you'll be signed in to your existing account.

## Admin Access

The first user to sign in with Google will automatically be granted admin access if their email matches the `ADMIN_EMAIL` environment variable.

## Troubleshooting

If you encounter a "redirect_uri_mismatch" error:

1. Double-check that the redirect URIs in the Google Cloud Console exactly match:
   - http://localhost:3000/api/auth/callback/google (for development)
   - https://online-bazar.top/api/auth/callback/google (for production)
   
2. Make sure there are no extra spaces or characters in the URIs

3. If you're testing on a different port or domain, make sure to add those to the authorized redirect URIs in the Google Cloud Console

4. After making changes to the Google Cloud Console, wait a few minutes for the changes to propagate