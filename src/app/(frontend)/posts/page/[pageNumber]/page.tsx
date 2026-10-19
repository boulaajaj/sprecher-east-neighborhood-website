import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { PostsFeed } from '@/components/PostsFeed'
import { findPublishedPosts, parsePageNumber, POSTS_PAGE_SIZE } from '@/utilities/feeds'
import PageClient from './page.client'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

/**
 * Crawlable, no-JavaScript fallback for the news listing. /posts loads more posts as
 * you scroll; its "Load more" control links here when JavaScript is unavailable.
 */
export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const page = parsePageNumber(pageNumber)
  if (page === null) notFound()

  const posts = await findPublishedPosts(page)
  if (page > 1 && page > posts.totalPages) notFound()

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-12 md:mb-16">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
          News · Page {page}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
          News &amp; Updates
        </h1>
        <Link
          href="/posts"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
        >
          ← Back to the latest news
        </Link>
      </div>

      <PostsFeed initial={posts} />
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `News & Updates — Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { totalDocs } = await payload.count({
      collection: 'posts',
      overrideAccess: false,
    })

    const totalPages = Math.ceil(totalDocs / POSTS_PAGE_SIZE)

    const pages: { pageNumber: string }[] = []

    for (let i = 1; i <= totalPages; i++) {
      pages.push({ pageNumber: String(i) })
    }

    return pages
  } catch (error) {
    console.error('[posts/page] generateStaticParams failed; falling back to []', error)
    return []
  }
}
