# Google Authentication Setup

This document explains how to set up Google Sign-In/Sign-Up for the Online Bazar application.

## Prerequisites

1. You need to have a Google Cloud Platform account
2. You need to create a Google OAuth 2.0 Client ID

## Setup Instructions

### 1. Create Google OAuth 2.0 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Click "Create"
8. Save the Client ID and Client Secret for later use

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Install Required Dependencies

Run the following command to install the required package:

```bash
npm install google-auth-library
```

Or if you're using pnpm:

```bash
pnpm add google-auth-library
```

### 4. API Route Implementation

The Google authentication API route is implemented in `src/app/api/auth/google/route.ts`. This route handles the OAuth callback and creates or logs in users.

### 5. Frontend Implementation

The Google Sign-In/Sign-Up buttons have been added to both the login and registration pages:
- Login page: `src/app/(frontend)/login/page.tsx`
- Registration page: `src/app/(frontend)/register/page.tsx`

## How It Works

1. When a user clicks the "Sign in with Google" or "Sign up with Google" button, they are redirected to Google's OAuth consent screen
2. After the user grants permission, Google redirects back to our application with an authorization code
3. Our frontend sends this code to our API route (`/api/auth/google`)
4. The API route exchanges the code for access tokens and fetches user information
5. If the user already exists, they are logged in; otherwise, a new account is created
6. The user is then redirected to the home page

## Password Visibility Toggle

Password visibility toggle functionality has been added to both the login and registration pages:
- Users can toggle password visibility using the eye icons next to password fields
- This improves usability by allowing users to verify their password input

## Testing

To test the Google authentication:

1. Ensure your environment variables are set correctly
2. Start your development server: `npm run dev`
3. Navigate to the login or registration page
4. Click the "Sign in with Google" or "Sign up with Google" button
5. Complete the Google authentication flow

## Troubleshooting

If you encounter issues:

1. Verify that your Google OAuth credentials are correct
2. Check that the redirect URIs in the Google Cloud Console match your application URLs
3. Ensure the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is correctly set in your environment variables
4. Check the browser console for any JavaScript errors
5. Check the server logs for any API errors