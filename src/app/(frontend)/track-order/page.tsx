import { Suspense } from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/site-config'

export const metadata = {
  title: `Track Your Order | ${SITE_NAME}`,
  description: 'Track the status of your order in real-time',
}

interface TrackOrderPageProps {
  searchParams: Promise<{ orderId?: string }>
}

const statusConfig = {
  pending: {
    label: 'অপেক্ষমান (Pending)',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'আপনার অর্ডার রিসিভ হয়েছে। আমরা শীঘ্রই প্রসেস শুরু করব।',
  },
  processing: {
    label: 'প্রক্রিয়াধীন (Processing)',
    icon: RefreshCw,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'আপনার অর্ডার প্রসেস হচ্ছে। আমরা প্যাকিং করছি।',
  },
  shipped: {
    label: 'শিপ করা হয়েছে (Shipped)',
    icon: Truck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'আপনার অর্ডার শিপ করা হয়েছে এবং পথে আছে।',
  },
  completed: {
    label: 'সম্পন্ন (Completed)',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'আপনার অর্ডার সফলভাবে ডেলিভারি হয়েছে!',
  },
  cancelled: {
    label: 'বাতিল (Cancelled)',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'এই অর্ডারটি বাতিল করা হয়েছে।',
  },
  refunded: {
    label: 'রিফান্ড (Refunded)',
    icon: RefreshCw,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'আপনার টাকা রিফান্ড করা হয়েছে।',
  },
}

const statusOrder = ['pending', 'processing', 'shipped', 'completed']

async function getOrder(orderId: string) {
  const payload = await getPayload({ config: await config })

  try {
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2,
    })
    return order
  } catch {
    return null
  }
}

async function OrderTracker({ orderId }: { orderId: string }) {
  const order = await getOrder(orderId)

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="mx-auto h-16 w-16 text-stone-300 mb-4" />
        <h2 className="text-xl font-semibold text-stone-700">অর্ডার পাওয়া যায়নি</h2>
        <p className="text-stone-500 mt-2">
          দয়া করে সঠিক অর্ডার আইডি দিন অথবা আপনার ইমেল চেক করুন।
        </p>
      </div>
    )
  }

  const currentStatus =
    (order as unknown as { status: keyof typeof statusConfig }).status || 'pending'
  const config = statusConfig[currentStatus] || statusConfig.pending
  const StatusIcon = config.icon
  const currentIndex = statusOrder.indexOf(currentStatus)
  const isCancelledOrRefunded = currentStatus === 'cancelled' || currentStatus === 'refunded'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Order Header */}
      <div className={cn('rounded-2xl border p-6 mb-8', config.bgColor, config.borderColor)}>
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full', config.bgColor, config.color)}>
            <StatusIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className={cn('text-xl font-bold', config.color)}>{config.label}</h2>
            <p className="text-stone-600 text-sm mt-1">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-8">
        <h3 className="font-semibold text-lg text-stone-800 mb-4">অর্ডারের বিবরণ</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-500">অর্ডার আইডি</p>
            <p className="font-medium text-stone-800">#{order.id}</p>
          </div>
          <div>
            <p className="text-stone-500">অর্ডারের তারিখ</p>
            <p className="font-medium text-stone-800">
              {(order as unknown as { orderDate: string }).orderDate
                ? new Date(
                    (order as unknown as { orderDate: string }).orderDate,
                  ).toLocaleDateString('bn-BD')
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-stone-500">মোট মূল্য</p>
            <p className="font-bold text-amber-600">
              ৳{((order as unknown as { totalAmount: number }).totalAmount || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-stone-500">ডেলিভারি চার্জ</p>
            <p className="font-medium text-stone-800">
              {(order as unknown as { freeDeliveryApplied: boolean }).freeDeliveryApplied
                ? 'ফ্রি'
                : `৳${((order as unknown as { shippingCharge: number }).shippingCharge || 0).toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelledOrRefunded && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-lg text-stone-800 mb-6">অর্ডার ট্র্যাকিং</h3>
          <div className="relative">
            {statusOrder.map((status, index) => {
              const step = statusConfig[status as keyof typeof statusConfig]
              const StepIcon = step.icon
              const isCompleted = index <= currentIndex
              const isCurrent = index === currentIndex

              return (
                <div key={status} className="flex items-start gap-4 pb-8 last:pb-0">
                  <div className="relative">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                        isCompleted
                          ? cn(step.bgColor, step.borderColor, step.color)
                          : 'bg-stone-100 border-stone-200 text-stone-400',
                        isCurrent && 'ring-4 ring-offset-2',
                        isCurrent && step.color.replace('text-', 'ring-').replace('-500', '-200'),
                      )}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    {index < statusOrder.length - 1 && (
                      <div
                        className={cn(
                          'absolute left-1/2 top-10 w-0.5 h-12 -translate-x-1/2',
                          isCompleted ? 'bg-amber-300' : 'bg-stone-200',
                        )}
                      />
                    )}
                  </div>
                  <div className="pt-2">
                    <p
                      className={cn(
                        'font-medium',
                        isCompleted ? 'text-stone-800' : 'text-stone-400',
                      )}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-stone-800 mb-4">শিপিং ঠিকানা</h3>
        <div className="text-sm text-stone-600 space-y-1">
          <p className="font-medium text-stone-800">
            {(order as unknown as { customerName: string }).customerName}
          </p>
          <p>
            {(order as unknown as { shippingAddress: { line1: string } }).shippingAddress?.line1}
          </p>
          {(order as unknown as { shippingAddress: { line2: string } }).shippingAddress?.line2 && (
            <p>
              {(order as unknown as { shippingAddress: { line2: string } }).shippingAddress.line2}
            </p>
          )}
          <p>
            {(order as unknown as { shippingAddress: { city: string } }).shippingAddress?.city},{' '}
            {
              (order as unknown as { shippingAddress: { postalCode: string } }).shippingAddress
                ?.postalCode
            }
          </p>
          <p className="text-stone-500 pt-2">
            📞 {(order as unknown as { customerNumber: string }).customerNumber}
          </p>
        </div>
      </div>
    </div>
  )
}

function TrackOrderForm() {
  return (
    <div className="max-w-md mx-auto text-center py-8">
      <Package className="mx-auto h-20 w-20 text-amber-500 mb-6" />
      <h2 className="text-2xl font-bold text-stone-800 mb-2">অর্ডার ট্র্যাক করুন</h2>
      <p className="text-stone-500 mb-6">আপনার অর্ডার আইডি দিয়ে ট্র্যাক করুন</p>
      <form className="space-y-4">
        <input
          type="text"
          name="orderId"
          placeholder="অর্ডার আইডি লিখুন (e.g., 123)"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
          required
        />
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          ট্র্যাক করুন
        </button>
      </form>
    </div>
  )
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const resolvedParams = await searchParams
  const orderId = resolvedParams?.orderId
  const headersList = await headers()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: headersList })

  return (
    <>
      <SiteHeader user={user} />
      <main className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center text-stone-800 mb-8">
            📦 অর্ডার ট্র্যাকিং
          </h1>

          <Suspense
            fallback={
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              </div>
            }
          >
            {orderId ? <OrderTracker orderId={orderId} /> : <TrackOrderForm />}
          </Suspense>
        </div>
      </main>
    </>
  )
}
