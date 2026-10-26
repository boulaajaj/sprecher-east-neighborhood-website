import type { Metadata } from 'next/types'

import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import React from 'react'

import { findPostPage, listPostPageNumbers, PostsFeed } from '@/modules/news/server'
import { parsePageNumber } from '@/platform/lib'
import { Link } from '@/platform/ui'

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

  const posts = await findPostPage(page)
  if (page > 1 && page > posts.totalPages) notFound()

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-12 md:mb-16">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
          News · Page {page}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
          News &amp; Updates
        </h1>
        <Link
          href="/posts"
          variant="action"
          icon={<ArrowLeft aria-hidden="true" />}
          className="mt-4"
        >
          Back to the latest news
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
    const pageNumbers = await listPostPageNumbers()
    return pageNumbers.map((pageNumber) => ({ pageNumber: String(pageNumber) }))
  } catch (error) {
    console.error('[posts/page] generateStaticParams failed; falling back to []', error)
    return []
  }
}
