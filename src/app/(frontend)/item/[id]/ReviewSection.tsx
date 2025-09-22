"use client"
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { ReviewStars } from '@/components/review-stars'

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, 'Please write at least 10 characters'),
})

type Review = {
  id: string
  rating: number
  title?: string
  comment: string
  createdAt?: string
  user?: any
  reviewerName?: string
}

export default function ReviewSection({
  itemId,
  canReview,
  userId,
  initialReviews,
}: {
  itemId: string
  canReview: boolean
  userId?: string | null
  initialReviews: Review[]
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || [])
  const [submitting, setSubmitting] = useState(false)

  const avg = useMemo(() => {
    if (!reviews?.length) return 0
    const sum = reviews.reduce((a, r) => a + Number(r.rating || 0), 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }, [reviews])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, title: '', comment: '' },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setSubmitting(true)
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, item: itemId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to submit review')
      toast.success('Review submitted. It will be visible after approval.')
      form.reset({ rating: 5, title: '', comment: '' })
    } catch (e: any) {
      toast.error(e?.message || 'Unable to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReviewStars value={avg} />
          <span className="text-sm text-gray-600">{reviews.length} reviews</span>
        </div>
      </div>

      <div className="space-y-8">
        {reviews?.length ? (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <ReviewStars value={r.rating} />
                  <span className="text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">By {getReviewerName(r)}</p>
                {r.title ? <h4 className="font-medium mt-1">{r.title}</h4> : null}
                <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">{r.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        )}
      </div>

      <div className="pt-2">
        {!userId ? (
          <p className="text-sm text-gray-600">Please log in to leave a review.</p>
        ) : !canReview ? (
          <p className="text-sm text-gray-600">You can review after you have a completed order for this product.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            type="button"
                            key={n}
                            onClick={() => field.onChange(n)}
                            className="p-1"
                            aria-label={`Rate ${n}`}
                          >
                            <Star className={`size-5 ${n <= field.value ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Great product!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your experience</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Share your experience..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}

function getReviewerName(r: Review) {
  if (r.reviewerName && r.reviewerName.trim().length > 0) return r.reviewerName
  const u: any = r.user
  const first = typeof u === 'object' ? (u?.firstName || '') : ''
  const last = typeof u === 'object' ? (u?.lastName || '') : ''
  const name = `${first} ${last}`.trim()
  if (name) return name
  const email = typeof u === 'object' ? u?.email : undefined
  return email || 'Verified Buyer'
}
