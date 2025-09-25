// Utility functions
export const getGoogleClientId = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try to get from window object (injected by server)
    return (window as any).GOOGLE_CLIENT_ID || null
  }
  return null
}