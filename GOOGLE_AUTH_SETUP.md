# Google OAuth Setup Instructions

## Step 1: Create a Google OAuth Client

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Application type: Web application
6. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (for development)
   - https://yourdomain.com/api/auth/callback/google (for production)
7. Authorized JavaScript origins:
   - http://localhost:3000
   - https://yourdomain.com

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```
AUTH_GOOGLE_ID=your_client_id_here
AUTH_GOOGLE_SECRET=your_client_secret_here
ADMIN_EMAIL=you@yourdomain.com
```

Replace the placeholder values with your actual Google OAuth credentials.

## Step 3: Testing

1. Start your development server: `pnpm dev`
2. Navigate to the login page
3. Click the "Continue with Google" button
4. You should be redirected to Google's OAuth flow

## Admin Access

The first user to sign in with Google will automatically be granted admin access if their email matches the `ADMIN_EMAIL` environment variable.