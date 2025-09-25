import { AuthClient } from 'payload-auth-plugin/client'

// The name 'frontend-auth' must match the name given to the authPlugin in payload.config.ts
export const frontendAuthClient = new AuthClient('frontend-auth')