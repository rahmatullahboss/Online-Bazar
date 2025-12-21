import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import ProfileForm from '../profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfileEditPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-rose-50/30 pb-24 md:pb-8">
      <SiteHeader variant="full" user={user} />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Profile</span>
        </Link>

        {/* Edit Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-sm text-gray-500">Update your personal information</p>
            </div>
          </div>

          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  )
}
