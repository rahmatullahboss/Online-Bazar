'use client'

import React from 'react'
import { useUser } from '@stackframe/stack'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TestAuthPage() {
  const user = useUser()

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Neon Auth Integration Test</CardTitle>
          <CardDescription>Verify that Google Sign-In is working correctly</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">User Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Display Name</p>
                  <p>{user.displayName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.primaryEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-sm font-mono">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Auth Type</p>
                  <p>Google OAuth</p>
                </div>
              </div>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">No user is currently signed in.</p>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/login">Go to Login Page</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}