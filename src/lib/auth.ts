import { AuthClient } from 'payload-auth-plugin/client'

// The name 'frontend-auth' must match the name given to the authPlugin in payload.config.ts
// By not providing a `payloadBaseURL`, the client will default to the current host,
// which is exactly what we need to avoid CORS issues between different Vercel deployment domains.
export const frontendAuthClient = new AuthClient('frontend-auth')