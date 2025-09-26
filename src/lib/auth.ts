import { AuthClient } from 'payload-auth-plugin/client'

const getBaseURL = () => {
  // In the browser, we want to use a relative path for API calls.
  // The AuthClient defaults to this behavior if payloadBaseURL is an empty string.
  if (typeof window !== 'undefined') {
    return ''
  }

  // On the server (during build or SSR), we must use the server URL from environment variables.
  const vc = process.env.VERCEL_URL
  // Use NEXT_PUBLIC_SERVER_URL which is consistent with the rest of the app
  const url = process.env.NEXT_PUBLIC_SERVER_URL

  if (url) {
    return url
  }

  if (vc) {
    return `https://${vc}`
  }

  // Fallback for local development.
  return 'http://localhost:3000'
}

// The name 'frontend-auth' must match the name given to the authPlugin in payload.config.ts.
export const frontendAuthClient = new AuthClient('frontend-auth', {
  payloadBaseURL: getBaseURL(),
})