'use client'
import React from 'react'
import { Button } from '@payloadcms/ui'
import './styles.scss'
import { adminAuthClient } from '@/lib/auth/adminAuthClient'

export const AdminLogin = () => {
  const { oauth } = adminAuthClient.signin()

  const handleGoogleSignin = async () => {
    oauth('google')
  }

  return (
    <div className="oauth-container">
      <Button type="button" onClick={handleGoogleSignin} className="oauth-btn">
        Sign in with Google
      </Button>
    </div>
  )
}