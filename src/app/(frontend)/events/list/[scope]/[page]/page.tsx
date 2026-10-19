import type { Metadata } from 'next/types'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { EventsFeed } from '@/components/EventsFeed'
import { findPublishedEvents, isEventScope, parsePageNumber } from '@/utilities/feeds'

export const revalidate = 600

type Args = {
  params: Promise<{ scope: string; page: string }>
}

const TITLES = { upcoming: 'Upcoming Events', past: 'Past Events' } as const

/**
 * Crawlable, no-JavaScript fallback for the events listing. /events loads more as you
 * scroll; its "Load more" control links here when JavaScript is unavailable.
 */
export default async function EventsListPage({ params: paramsPromise }: Args) {
  const { scope, page: pageParam } = await paramsPromise
  const page = parsePageNumber(pageParam)
  if (!isEventScope(scope) || page === null) notFound()

  const events = await findPublishedEvents(scope, page)
  if (page > 1 && page > events.totalPages) notFound()

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-12">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
          Community Calendar · Page {page}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
          {TITLES[scope]}
        </h1>
        <Link
          href="/events"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
        >
          ← Back to all events
        </Link>
      </div>
      <section className="container">
        <EventsFeed scope={scope} initial={events} />
      </section>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { scope, page } = await paramsPromise
  const title = isEventScope(scope) ? TITLES[scope] : 'Events'
  return { title: `${title} — Page ${page}` }
}
