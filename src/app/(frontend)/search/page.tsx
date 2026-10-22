import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import type { CardPostData } from '@/components/Card'

type Args = {
  searchParams: Promise<{
    q?: string | string[]
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q } = await searchParamsPromise
  // `?q=a&q=b` gives an array: use the first. A query of only spaces is no query
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    overrideAccess: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-12 md:mb-16">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Search
        </h1>
        <div className="max-w-[50rem]">
          <Search initialQuery={query} />
        </div>
      </div>

      {posts.docs && posts.docs.length > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">No results found.</p>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search',
    description: 'Search the Sprecher East website for news, events, and resources.',
  }
}
