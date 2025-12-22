'use client'

import { Phone, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT_PHONE_RAW } from '@/lib/site-config'

export function FloatingContactButtons() {
  const openChatbot = () => {
    // Dispatch custom event to open chatbot
    window.dispatchEvent(new CustomEvent('open-chatbot'))
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-40 flex flex-col items-start gap-3">
      <Button
        asChild
        size="sm"
        className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-[1.02] hover:bg-emerald-600 focus-visible:ring-emerald-500"
      >
        <a href={`tel:${CONTACT_PHONE_RAW}`} aria-label={`Call us at ${CONTACT_PHONE_RAW}`}>
          <Phone className="size-4" />
          Call Now
        </a>
      </Button>
      <Button
        size="sm"
        onClick={openChatbot}
        className="bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/30 transition-transform hover:scale-[1.02] hover:from-amber-600 hover:to-rose-600"
      >
        <Bot className="size-4" />
        AI Chat
      </Button>
    </div>
  )
}
