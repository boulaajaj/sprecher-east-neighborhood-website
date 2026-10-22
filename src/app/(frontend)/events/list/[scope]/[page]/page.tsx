import type { Metadata } from 'next/types'

import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import React from 'react'

import { isEventScope } from '@/modules/events'
import { EventsFeed, listEventPage } from '@/modules/events/server'
import { parsePageNumber } from '@/platform/lib'
import { Link } from '@/platform/ui'

export const revalidate = 600

/** No pages at build time; each one is rendered on first visit and then cached like ISR. */
export function generateStaticParams() {
  return []
}

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

  const events = await listEventPage(scope, page)
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
          variant="action"
          icon={<ArrowLeft aria-hidden="true" />}
          className="mt-4"
        >
          Back to all events
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
