import type { Metadata } from 'next/types'

import React from 'react'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { findPublishedEvents } from '@/utilities/feeds'
import { siteTimeZoneLabel } from '@/utilities/timezone'
import { EventsFeed } from '@/components/EventsFeed'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function EventsPage() {
  // First page of each list is rendered on the server; the rest loads as the reader scrolls.
  const [upcoming, past] = await Promise.all([
    findPublishedEvents('upcoming', 1),
    findPublishedEvents('past', 1),
  ])

  return (
    <div className="pt-24 pb-24">
      {/* Page header */}
      <div className="container mb-12 md:mb-16">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
          Community Calendar
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
          Community Events
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Join your neighbors at upcoming events in and around the Sprecher East neighborhood. All
          times are {siteTimeZoneLabel()}.
        </p>
      </div>

      {/* Upcoming events */}
      <section aria-labelledby="upcoming-heading" className="container mb-16">
        <h2 id="upcoming-heading" className="mb-8 text-2xl font-bold text-foreground">
          Upcoming Events
        </h2>
        {upcoming.totalDocs > 0 ? (
          <EventsFeed scope="upcoming" initial={upcoming} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-8 md:p-12">
            <p className="text-lg text-foreground">No upcoming events are posted right now.</p>
            <p className="mt-2 text-muted-foreground">
              Check back soon, or browse past events below to see what neighbors have been up to.
            </p>
          </div>
        )}
      </section>

      {/* Past events */}
      {past.totalDocs > 0 && (
        <section aria-labelledby="past-heading" className="border-t border-border bg-surface py-16">
          <div className="container">
            <h2 id="past-heading" className="mb-8 text-2xl font-bold text-foreground">
              Past Events
            </h2>
            <EventsFeed scope="past" initial={past} />
          </div>
        </section>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  const title = 'Community Events'
  const description =
    'Upcoming events in the Sprecher East neighborhood — meetings, socials, volunteer opportunities, and more.'

  return {
    title,
    description,
    openGraph: mergeOpenGraph({ title, description }),
  }
}
