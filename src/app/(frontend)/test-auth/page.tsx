'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TestAuthPage() {
  // Since we're not using StackProvider, we'll set user to null
  const user = null

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
                  <p>N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-sm font-mono">N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Primary Email Verified</p>
                  <p>N/A</p>
                </div>
              </div>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                You are not currently signed in with Google. This page is used to test the Neon Auth integration.
              </p>
              <p className="text-gray-600">
                To test the integration, you would need to set up the StackProvider with the proper environment variables.
              </p>
              <div className="pt-4 flex gap-3">
                <Button asChild>
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}