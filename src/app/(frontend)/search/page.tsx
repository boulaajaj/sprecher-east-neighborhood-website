import type { Metadata } from 'next/types'

import React from 'react'

import { parseSearchQuery } from '@/modules/news'
import { findSearchResults, PostGrid, SearchBox } from '@/modules/news/server'
import PageClient from './page.client'

type Args = {
  searchParams: Promise<{
    q?: string | string[]
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q } = await searchParamsPromise
  const query = parseSearchQuery(q)
  const results = await findSearchResults(query)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-12 md:mb-16">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Search
        </h1>
        <div className="max-w-[50rem]">
          <SearchBox initialQuery={query} />
        </div>
      </div>

      {results.length > 0 ? (
        <PostGrid posts={results} />
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
