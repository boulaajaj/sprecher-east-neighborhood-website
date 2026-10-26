import type { Metadata } from 'next/types'

import { notFound } from 'next/navigation'
import React from 'react'

import { isEventScope } from '@/modules/events'
import { EventsFeed, findEventPage } from '@/modules/events/server'
import { parsePageNumber } from '@/platform/lib'
import { PageHeader } from '@/platform/ui/PageHeader'

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

  const events = await findEventPage(scope, page)
  if (page > 1 && page > events.totalPages) notFound()

  return (
    <div className="pt-24 pb-24">
      <PageHeader
        eyebrow={`Community Calendar · Page ${page}`}
        title={TITLES[scope]}
        backLink={{ href: '/events', label: 'Back to all events' }}
      />
      <section className="container">
        <EventsFeed scope={scope} initial={events} headingLevel="h2" />
      </section>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { scope, page } = await paramsPromise
  const title = isEventScope(scope) ? TITLES[scope] : 'Events'
  return { title: `${title} — Page ${page}` }
}
