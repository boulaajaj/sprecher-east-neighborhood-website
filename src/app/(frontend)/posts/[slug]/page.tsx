import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { SidebarPosts } from '@/components/SidebarPosts'
import { SidebarEvents } from '@/components/SidebarEvents'
import { SidebarCTA } from '@/components/SidebarCTA'
import { startOfToday } from '@/utilities/timezone'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { articleJsonLd } from '@/utilities/structuredData'
import { JsonLd } from '@/components/JsonLd'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    return posts.docs.map(({ slug }) => ({ slug }))
  } catch {
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
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const relatedPosts = (post.relatedPosts?.filter((p) => typeof p === 'object') ?? []) as Post[]
  const relatedPostIds = relatedPosts.map((p) => p.id)
  const recentPosts = await queryRecentPosts({
    excludeIds: [post.id, ...relatedPostIds],
  })
  const upcomingEvents = await queryUpcomingEvents()

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <JsonLd data={articleJsonLd(post)} />

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
            <RichText className="max-w-[48rem]" data={post.content} enableGutter={false} />
          </div>

          <aside className="mt-12 space-y-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
            <SidebarPosts posts={relatedPosts} title="Related Posts" />
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
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  const meta = await generateMeta({ doc: post })
  if (!post) return meta

  return {
    ...meta,
    openGraph: {
      ...(meta.openGraph ?? {}),
      url: `/posts/${post.slug}`,
    },
  }
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const queryRecentPosts = cache(async ({ excludeIds }: { excludeIds: number[] }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 3,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      id: { not_in: excludeIds },
    },
    select: {
      title: true,
      slug: true,
      meta: true,
    },
  })

  return result.docs
})

const queryUpcomingEvents = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft: false,
    limit: 3,
    overrideAccess: false,
    sort: 'date',
    where: {
      date: { greater_than_equal: startOfToday() },
    },
    select: {
      title: true,
      slug: true,
      date: true,
      category: true,
    },
  })

  return result.docs
})
