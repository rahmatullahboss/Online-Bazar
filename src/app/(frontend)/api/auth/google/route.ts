import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Redirect to the OAuth authorization endpoint provided by payload-auth-plugin
  // The plugin creates endpoints at /:pluginType/oauth/:resource/:provider
  // Since we named our plugin "admin", the endpoint is /admin/oauth/authorization/google
  // Use the current host to avoid port mismatch issues
  const url = new URL(request.url)
  const redirectUrl = `${url.origin}/admin/oauth/authorization/google`
  console.log('Redirecting to Google OAuth:', redirectUrl)
  return NextResponse.redirect(redirectUrl)
}