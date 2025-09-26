import { AuthClient } from 'payload-auth-plugin/client'

const getPayloadURL = () => {
  // Allow overriding the server URL with an explicit environment variable
  const explicit = process.env.NEXT_PUBLIC_SERVER_URL

  // In Vercel, `VERCEL_URL` is set for each deployment, including preview domains
  const vercelURL = process.env.VERCEL_URL

  if (explicit) {
    return explicit
  }

  if (vercelURL) {
    return `https://${vercelURL}`
  }

  // Fallback for local development
  return 'http://localhost:3000'
}

// The name 'frontend-auth' must match the name given to the authPlugin in payload.config.ts
export const frontendAuthClient = new AuthClient('frontend-auth', {
  payloadBaseURL: getPayloadURL(),
})