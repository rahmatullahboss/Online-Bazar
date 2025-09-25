# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for your application.

## Prerequisites

1. You must have a Google Cloud Platform account
2. You must have a project created in Google Cloud Console

## Setup Steps

### 1. Create OAuth Credentials in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following authorized redirect URIs:
   - For development: `http://localhost:3000/api/admin/oauth/callback/google`
   - For production: `https://yourdomain.com/api/admin/oauth/callback/google`
7. Click "Create"
8. Copy the Client ID and Client Secret

### 2. Update Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
PAYLOAD_AUTH_SECRET=your_generated_secret_here
NEXT_PUBLIC_PAYLOAD_AUTH_URL=your_domain_here
```

Replace the placeholder values with your actual credentials.

### 3. Test the Setup

1. Start your application
2. Navigate to the login or registration page
3. Click the "Sign in with Google" button
4. You should be redirected to Google's OAuth page
5. After authenticating, you should be redirected back to your application

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch**: Make sure the redirect URIs in Google Cloud Console match exactly with the ones your application is using.

2. **Invalid client credentials**: Double-check that you've copied the Client ID and Client Secret correctly from Google Cloud Console.

3. **CORS errors**: Ensure your server URL is correctly configured in the Payload configuration.

### Debugging Steps

1. Check the browser console for any JavaScript errors
2. Check the server logs for any authentication errors
3. Verify that all environment variables are correctly set
4. Ensure the OAuth callback URLs are correctly configured in Google Cloud Console

## How It Works

The Google OAuth integration works as follows:

1. User clicks "Sign in with Google" button
2. User is redirected to Google's OAuth page
3. User authenticates with Google
4. Google redirects back to your application with an authorization code
5. Your application exchanges the authorization code for an access token
6. User information is retrieved from Google
7. If the user doesn't exist in your database, a new user is created
8. User is logged in and redirected to the appropriate page

## Security Considerations

1. Always keep your Client Secret secure and never expose it in client-side code
2. Use HTTPS in production
3. Regularly rotate your secrets
4. Monitor authentication logs for suspicious activity