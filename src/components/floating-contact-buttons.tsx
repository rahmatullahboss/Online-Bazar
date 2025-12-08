import { MessageCircle, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function FloatingContactButtons() {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col items-end gap-3">
      <Button
        asChild
        size="sm"
        className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-[1.02] hover:bg-emerald-600 focus-visible:ring-emerald-500"
      >
        <a href="tel:01639590392" aria-label="Call us at 01639590392">
          <Phone className="size-4" />
          Call Now
        </a>
      </Button>
      <Button
        asChild
        size="sm"
        className="bg-[#0084FF] text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-[1.02] hover:bg-[#0073E6] focus-visible:ring-[#0084FF]"
      >
        <a
          href="https://www.m.me/onlinebazarbarguna"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on Messenger"
        >
          <MessageCircle className="size-4" />
          Message Us
        </a>
      </Button>
    </div>
  )
}
