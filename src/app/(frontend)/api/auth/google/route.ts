import { NextResponse } from 'next/server'

export async function GET() {
  // Redirect to the OAuth endpoint
  const redirectUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/oauth/callback/google`
  return NextResponse.redirect(redirectUrl)
}