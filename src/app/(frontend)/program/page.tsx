import React from 'react'
import { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SiteHeader } from '@/components/site-header'
import { ProgramRegistrationForm } from '@/components/program-registration-form'
import Image from 'next/image'

// Updated metadata with proper Open Graph tags
export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const serverURL = payload.config.serverURL || 'https://online-bazar.top'

  return {
    title: 'Special Program for School Students | Online Bazar',
    description:
      'Experience the future of shopping with our curated collection of premium items, delivered with precision and passion.',
    openGraph: {
      title: 'Special Program for School Students | Online Bazar',
      description:
        'Experience the future of shopping with our curated collection of premium items, delivered with precision and passion.',
      url: `${serverURL}/program`,
      siteName: 'Online Bazar',
      images: [
        {
          url: `${serverURL}/sunbeam.png`,
          width: 1200,
          height: 630,
          alt: 'Sunbeam School Program',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Special Program for School Students | Online Bazar',
      description:
        'Experience the future of shopping with our curated collection of premium items, delivered with precision and passion.',
      images: [`${serverURL}/sunbeam.png`],
    },
    other: {
      'fb:app_id': process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    },
  }
}

export default async function ProgramPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })

  // Get user for header
  const authResult = await payload.auth({ headers })
  const user = authResult?.user ?? null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-100 text-gray-800">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.35),_transparent_65%)] motion-reduce:opacity-25"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.3),_transparent_60%)] motion-reduce:opacity-25 animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(147,197,253,0.25),_transparent_60%)] motion-reduce:opacity-20 animation-delay-4000"></div>
      </div>

      <div className="relative z-20">
        <SiteHeader variant="full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-12 pb-20">
        <article className="max-w-3xl mx-auto">
          {/* Increased padding for heading box from py-4 px-6 to py-8 px-8 */}
          <h1 className="group text-4xl font-bold mb-8 text-center brand-text py-8 px-8 bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transition-all duration-500 hover:bg-white/40 hover:shadow-3xl hover:-translate-y-1 relative">
            {/* Animated glow effect with reduced opacity from /20 to /10 */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/10 via-rose-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
            {/* Interactive floating elements with reduced opacity from default to /80 */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-amber-400 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-700 transform group-hover:translate-x-1 group-hover:-translate-y-1"></div>
            <div className="absolute -bottom-3 -right-3 w-4 h-4 bg-blue-400 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-700 transform group-hover:-translate-x-1 group-hover:translate-y-1"></div>
            ক্যালিক্স ও সানবীম স্কুলের শিক্ষার্থীদের জন্য এক বিশেষ আয়োজন
            {/* Interactive underline effect with reduced opacity from default to /80 */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
          </h1>

          {/* Sunbeam image below the heading */}
          <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
            <Image
              src="/sunbeam.png"
              alt="Sunbeam School Program"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="group prose max-w-none mb-8 bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-500 hover:bg-white/40 hover:shadow-3xl relative">
            {/* Animated glow effect with reduced opacity from /20 to /10 to match other elements */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/10 via-rose-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

            <h2 className="text-2xl font-bold mb-6 relative z-10">Description</h2>
            <p className="mb-6 relative z-10">প্রিয় ক্যালিক্স ও সানবীম স্কুলের বন্ধুরা,</p>

            <p className="mb-6 relative z-10">
              তোমাদের জন্য আমরা নিয়ে এসেছি এক অসাধারণ আয়োজন! পড়াশোনার পাশাপাশি নতুন কিছু শেখা,
              বন্ধুদের সাথে মজার সব অ্যাক্টিভিটি করা এবং নিজের প্রতিভাকে সবার সামনে তুলে ধরার একটি
              দারুণ সুযোগ থাকছে এই প্রোগ্রামে।
            </p>

            <p className="mb-6 relative z-10">আমাদের এই বিশেষ আয়োজনে তোমাদের জন্য থাকছে:</p>

            <ul className="list-disc pl-6 mb-6 relative z-10">
              <li className="mb-4">মজার মজার শিক্ষামূলক কুইজ ও প্রতিযোগিতা।</li>
              <li className="mb-4">বিজ্ঞান ও প্রযুক্তির উপর ক্রিয়েটিভ ওয়ার্কশপ।</li>
              <li className="mb-4">ছবি আঁকা এবং বিভিন্ন সৃজনশীল কাজের সুযোগ।</li>
              <li>নতুন বন্ধুদের সাথে পরিচিত হওয়ার এবং দলবদ্ধ হয়ে কাজ করার সুযোগ।</li>
            </ul>

            <p className="mb-8 relative z-10">
              স্কুলের চার দেয়ালের বাইরে নতুন কিছু অভিজ্ঞতা অর্জন করতে এবং একটি अবिस्मरণীয় দিন
              কাটাতে চাইলে আর দেরি কেন? আজই নিচের ফর্মটি পূরণ করে আমাদের সাথে যোগ দাও &quot;জ্ঞানের
              উৎসবে&quot;।
            </p>

            <h3 className="text-xl font-bold mb-6 relative z-10">
              প্রোগ্রামে অংশগ্রহণ করতে নিচের ফর্মটি সঠিকভাবে পূরণ করো।
            </h3>

            <div className="relative z-10">
              <ProgramRegistrationForm />
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
