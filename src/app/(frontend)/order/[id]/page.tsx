import { notFound } from 'next/navigation'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // In a real app, you would fetch the item details here
  // For this demo, we'll just show the ID
  if (!id) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Order Confirmation</h1>
        
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-semibold">Order Details</h2>
          <p className="mb-6 text-gray-600">You are ordering item: <span className="font-mono bg-amber-100 px-2 py-1 rounded">{id}</span></p>
          
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <h3 className="mb-2 font-semibold text-green-800">Order in Progress</h3>
            <p className="text-green-700">Your order is being processed. You will receive a confirmation email shortly.</p>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button 
              className="rounded-full bg-amber-500 px-6 py-3 text-white font-medium hover:bg-amber-600 transition-colors"
              onClick={() => window.history.back()}
            >
              Back to Product
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}