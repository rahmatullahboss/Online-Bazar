import { getPayloadHMR } from '@payloadcms/next/utilities'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'

export async function POST() {
  const payload = await getPayloadHMR({ config: configPromise })
  
  try {
    // Clear the payload auth cookie
    const cookieStore = cookies()
    const cookieName = `${payload.config.cookiePrefix || 'payload'}-token`
    
    const response = NextResponse.json({ success: true })
    response.cookies.delete(cookieName)
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 })
  }
}