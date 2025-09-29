'use client'

import React from 'react'
import { useUser } from '@stackframe/stack'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const user = useUser()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Check if Neon Auth is working correctly</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">You are signed in as:</p>
                <p className="font-medium">{user.primaryEmail}</p>
                <p className="text-sm text-gray-600">User ID: {user.id}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">You are not signed in</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}