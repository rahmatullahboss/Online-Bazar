import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Post } from '@/payload-types'
import RichText from '@/components/RichText'
import { SiteHeader } from '@/components/site-header'
import { BlogImage } from '@/components/blog-image'

export const dynamic = 'force-dynamic'

// Function to get image URL
const getImageUrl = (image: any, serverURL: string): string => {
  if (!image) return '/og-image.png'

  // If it's already a string URL
  if (typeof image === 'string') {
    return image.startsWith('http') ? image : `${serverURL || ''}${image}`
  }

  // If it's an object with a URL property
  if (typeof image === 'object' && image.url) {
    return image.url.startsWith('http') ? image.url : `${serverURL || ''}${image.url}`
  }

  return '/og-image.png'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const { slug } = resolvedParams

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
    depth: 1,
  })

  if (!posts.docs.length) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  const post: Post = posts.docs[0]
  const serverURL = payload.config.serverURL || 'http://localhost:3000'

  // Get the featured image URL or fallback to og-image.png
  const imageUrl = post.featuredImage ? getImageUrl(post.featuredImage, serverURL) : '/og-image.png'

  return {
    title: post.title,
    description:
      post.excerpt || (post.content ? 'Read more about this topic' : 'Online Bazar blog post'),
    openGraph: {
      title: post.title,
      description:
        post.excerpt || (post.content ? 'Read more about this topic' : 'Online Bazar blog post'),
      url: `${serverURL}/blog/${slug}`,
      siteName: 'Online Bazar',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title || 'Blog post image',
        },
      ],
      type: 'article',
      publishedTime: post.publishedDate,
      authors:
        post.author && typeof post.author !== 'number'
          ? [`${post.author.firstName} ${post.author.lastName}`]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description:
        post.excerpt || (post.content ? 'Read more about this topic' : 'Online Bazar blog post'),
      images: [imageUrl],
    },
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const { slug } = resolvedParams

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })

  // Get user for header
  const authResult = await payload.auth({ headers })
  const user = authResult?.user ?? null

  const posts = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
    depth: 2, // Fetch related data like author and featuredImage
  })

  if (!posts.docs.length) {
    notFound()
  }

  const post: Post = posts.docs[0]

  // Function to get image URL
  const getImageUrl = (image: any): string => {
    if (!image) return '/og-image.png'

    // If it's already a string URL
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${payload.config.serverURL || ''}${image}`
    }

    // If it's an object with a URL property
    if (typeof image === 'object' && image.url) {
      return image.url.startsWith('http')
        ? image.url
        : `${payload.config.serverURL || ''}${image.url}`
    }

    return '/og-image.png'
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.35),_transparent_65%)] motion-reduce:opacity-25"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.3),_transparent_60%)] motion-reduce:opacity-25 animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:filter-none motion-reduce:mix-blend-normal motion-reduce:bg-[radial-gradient(circle_at_center,_rgba(147,197,253,0.25),_transparent_60%)] motion-reduce:opacity-20 animation-delay-4000"></div>
      </div>

      <div className="relative z-20">
        <SiteHeader variant="full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-4 pb-20">
        <article className="max-w-3xl mx-auto">
          {/* Reduced padding for post header and increased padding for brand text with reduced hover opacity */}
          <div className="group py-12 px-6 bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 mb-8 transition-all duration-500 hover:bg-white/40 hover:shadow-3xl hover:-translate-y-1 relative">
            {/* Animated glow effect with reduced opacity from /20 to /10 */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/10 via-rose-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

            <Link
              href="/blog"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8 relative z-10 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                ←
              </span>
              <span className="ml-2">Back to Blog</span>
            </Link>

            <h1 className="text-4xl font-bold mb-6 relative z-10 py-4 px-6"> {post.title}</h1>

            <div className="flex flex-wrap items-center text-gray-600 mb-8 gap-4 relative z-10">
              <span>{post.publishedDate && new Date(post.publishedDate).toLocaleDateString()}</span>
              {post.author && typeof post.author !== 'number' && (
                <span>
                  By {post.author.firstName} {post.author.lastName}
                </span>
              )}
              {post.category && typeof post.category !== 'number' && (
                <span className="bg-amber-100 text-amber-800 px-3 py-2 rounded text-sm">
                  {post.category.name}
                </span>
              )}
            </div>

            {/* Interactive underline effect with reduced opacity from default to /80 */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
          </div>

          {post.featuredImage && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8 shadow-lg">
              <BlogImage
                src={getImageUrl(post.featuredImage)}
                alt={post.title || 'Blog post image'}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          {post.content && (
            <div className="group prose max-w-none mb-8 bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 transition-all duration-500 hover:bg-white/40 hover:shadow-3xl relative">
              {/* Animated glow effect with reduced opacity from /20 to /10 */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/10 via-rose-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

              <div className="relative z-10">
                <RichText content={post.content} />
              </div>
            </div>
          )}

          {post.excerpt && (
            <div className="group mt-6 p-4 bg-amber-50/50 backdrop-blur-sm rounded-2xl border border-amber-100/50 shadow-sm transition-all duration-500 hover:bg-amber-50/70 hover:shadow-md relative">
              {/* Animated glow effect with reduced opacity from /10 to /5 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-lg"></div>

              <h3 className="font-semibold mb-2 text-amber-800 relative z-10">Summary:</h3>
              <p className="text-gray-700 relative z-10">{post.excerpt}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/blog"
              className="group inline-flex items-center text-amber-600 hover:text-amber-700"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                ←
              </span>
              <span className="ml-2">Back to Blog</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
