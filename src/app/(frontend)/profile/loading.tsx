import { Suspense } from 'react'

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-rose-50/30 pb-24 md:pb-8">
      {/* Header skeleton */}
      <div className="fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 h-16" />

      <div className="container mx-auto px-4 py-6 max-w-4xl pt-20">
        {/* Profile Header Skeleton */}
        <div className="relative bg-gradient-to-r from-gray-300 to-gray-400 rounded-3xl shadow-xl p-6 sm:p-8 mb-6 overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar skeleton */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/30" />

            {/* User info skeleton */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="h-8 w-48 bg-white/30 rounded-lg" />
                <div className="h-5 w-20 bg-white/20 rounded-full" />
              </div>
              <div className="h-4 w-40 bg-white/20 rounded mx-auto sm:mx-0" />
              <div className="h-3 w-32 bg-white/15 rounded mx-auto sm:mx-0" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center animate-pulse"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-gray-200" />
              <div className="h-6 w-12 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100" />
              <div className="space-y-1 text-center">
                <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                <div className="h-3 w-12 bg-gray-100 rounded mx-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200" />
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                  <div className="h-5 w-14 bg-gray-100 rounded ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Profile Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Sign Out Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 animate-pulse">
          <div className="h-10 w-full bg-gray-200 rounded-lg" />
          <div className="h-3 w-48 bg-gray-100 rounded mx-auto mt-3" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return <ProfileSkeleton />
}
