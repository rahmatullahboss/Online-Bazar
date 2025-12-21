'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'

type ProfileAvatarProps = {
  initial: string
  photoUrl?: string | null
}

export function ProfileAvatar({ initial, photoUrl }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/users/profile-photo', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentPhotoUrl(data.url)
        // Refresh page to get updated user data
        window.location.reload()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />

      <div
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl overflow-hidden cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : currentPhotoUrl ? (
          <Image
            src={currentPhotoUrl}
            alt="Profile photo"
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          initial
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <Camera className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  )
}
