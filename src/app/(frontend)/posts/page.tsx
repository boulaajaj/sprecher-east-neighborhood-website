import type { Metadata } from 'next/types'

import React from 'react'

import { findPostPage, PostsFeed } from '@/modules/news/server'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  // First page is rendered on the server; more posts load as the reader scrolls.
  const posts = await findPostPage(1)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-12 md:mb-16">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">News</p>
        <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
          News &amp; Updates
        </h1>
      </div>

      <PostsFeed initial={posts} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'News & Updates',
    description: 'Latest news and updates from the Sprecher East neighborhood.',
  }
}
