'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, Trash2, Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'

interface CartActionsProps {
  cartId: string
  status: string
  customerPhone?: string
}

export function CartActions({ cartId, status, customerPhone }: CartActionsProps) {
  const router = useRouter()
  const [recovering, setRecovering] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleMarkRecovered = async () => {
    setRecovering(true)
    try {
      const res = await fetch(`/api/abandoned-carts/${cartId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Recovered via phone call' }),
      })

      if (res.ok) {
        toast.success('Cart marked as recovered!')
        router.refresh()
      } else {
        toast.error('Failed to update cart')
      }
    } catch (_e) {
      toast.error('Failed to update cart')
    } finally {
      setRecovering(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/abandoned-carts/${cartId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Cart deleted')
        router.refresh()
      } else {
        toast.error('Failed to delete cart')
      }
    } catch (_e) {
      toast.error('Failed to delete cart')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Call Customer Button */}
      {customerPhone && (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
        >
          <a href={`tel:${customerPhone}`}>
            <Phone className="w-4 h-4" />
            Call
          </a>
        </Button>
      )}

      {/* Mark as Recovered Button - only show for abandoned carts */}
      {status === 'abandoned' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkRecovered}
          disabled={recovering}
          className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          {recovering ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Recovered
        </Button>
      )}

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this abandoned cart record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
