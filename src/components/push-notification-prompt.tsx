'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '@/lib/use-push-notifications'
import { Button } from '@/components/ui/button'

interface PushNotificationPromptProps {
  showAfterOrder?: boolean
  className?: string
}

export function PushNotificationPrompt({
  showAfterOrder = false,
  className = '',
}: PushNotificationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { isSupported, permission, isSubscribed, isLoading, subscribe } = usePushNotifications()

  useEffect(() => {
    // Don't show if not supported, already subscribed, or permission denied
    if (!isSupported || isSubscribed || permission === 'denied') {
      return
    }

    // Check if user has already dismissed this prompt
    const dismissed = localStorage.getItem('push-prompt-dismissed')
    if (dismissed === 'true') {
      return
    }

    // Show prompt after a delay for better UX
    const timer = setTimeout(
      () => {
        setIsVisible(true)
      },
      showAfterOrder ? 500 : 3000,
    )

    return () => clearTimeout(timer)
  }, [isSupported, isSubscribed, permission, showAfterOrder])

  const handleSubscribe = async () => {
    const success = await subscribe()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    localStorage.setItem('push-prompt-dismissed', 'true')
  }

  if (!isVisible || isDismissed || isSubscribed) {
    return null
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300 ${className}`}
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Get Order Updates</h3>
            <p className="text-gray-600 text-xs mt-0.5">
              Get instant notifications when your order ships and arrives.
            </p>

            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                size="sm"
                className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600"
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs text-gray-500 hover:text-gray-700"
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
