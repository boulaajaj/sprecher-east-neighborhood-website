import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import React from 'react'

import { Breadcrumbs } from '@/platform/ui/Breadcrumbs'
import { JsonLd } from '@/platform/ui/JsonLd'
import { LivePreviewListener } from '@/platform/ui/LivePreviewListener.client'
import { PayloadRedirects } from '@/modules/site/server'
import { RichText } from '@/platform/richtext/RichText'
import { richTextBlocks } from '@/platform/richtext/richTextBlocks'
import { SidebarCTA } from '@/platform/ui/SidebarCTA'
import { findUpcomingEvents, SidebarEvents } from '@/modules/events/server'
import {
  findRecentPosts,
  getPostBySlug,
  listPostSlugs,
  PostHero,
  postJsonLd,
  SidebarPosts,
} from '@/modules/news/server'
import { generateMeta } from '@/platform/seo/generateMeta'
import PageClient from './page.client'

// A scheduled publish or unpublish runs outside a request, where Next can't refresh the cache, so
// the page also re-renders every 10 minutes (#141, decision 0011)
export const revalidate = 600

export async function generateStaticParams() {
  try {
    const posts = await listPostSlugs()
    return posts.map(({ slug }) => ({ slug }))
  } catch (error) {
    console.error('[posts] generateStaticParams failed; falling back to []', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await getPostBySlug(decodedSlug)

  if (!post) return <PayloadRedirects url={url} />

  // News and events meet here, not in either module (docs/architecture decision 0008)
  const [recentPosts, upcomingEvents] = await Promise.all([
    findRecentPosts(post),
    findUpcomingEvents(),
  ])

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <JsonLd data={postJsonLd(post)} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="pt-8">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'News & Updates', href: '/posts' },
              { label: post.title },
            ]}
          />
        </div>
        <div className="container lg:grid lg:grid-cols-[1fr_18rem] lg:gap-8">
          <div>
            <RichText
              className="max-w-[48rem]"
              data={post.content}
              blocks={richTextBlocks}
              enableGutter={false}
            />
          </div>

          <aside className="mt-12 space-y-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
            <SidebarPosts posts={post.relatedPosts} title="Related Posts" />
            <SidebarPosts posts={recentPosts} title="You May Also Like" />
            <SidebarEvents events={upcomingEvents} title="Upcoming Events" />
            <SidebarCTA
              heading="Get Involved"
              description="Join your neighbors in building a stronger Sprecher East community."
              buttonLabel="Learn How"
              buttonHref="/get-involved"
            />
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await getPostBySlug(decodeURIComponent(slug))

  const meta = await generateMeta({ doc: post && { slug: post.slug, meta: post.meta } })
  if (!post) return meta

  return {
    ...meta,
    openGraph: {
      ...(meta.openGraph ?? {}),
      url: post.href,
    },
  }
}
