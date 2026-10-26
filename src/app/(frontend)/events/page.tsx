import type { Metadata } from 'next/types'

import React from 'react'

import { EventsFeed, findEventPage } from '@/modules/events/server'
import { mergeOpenGraph } from '@/platform/seo/mergeOpenGraph'
import { siteTimeZoneLabel } from '@/platform/lib/timezone'
import { EmptyState } from '@/platform/ui/EmptyState'
import { PageHeader } from '@/platform/ui/PageHeader'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function EventsPage() {
  // First page of each list is rendered on the server; the rest loads as the reader scrolls.
  const [upcoming, past] = await Promise.all([
    findEventPage('upcoming', 1),
    findEventPage('past', 1),
  ])

  return (
    <div className="pt-24 pb-24">
      {/* Page header */}
      <PageHeader
        eyebrow="Community Calendar"
        title="Community Events"
        description={`Join your neighbors at upcoming events in and around the Sprecher East neighborhood. All times are ${siteTimeZoneLabel()}.`}
      />

      {/* Upcoming events */}
      <section aria-labelledby="upcoming-heading" className="container mb-16">
        <h2 id="upcoming-heading" className="mb-8 text-2xl font-bold text-foreground">
          Upcoming Events
        </h2>
        {upcoming.totalDocs > 0 ? (
          <EventsFeed scope="upcoming" initial={upcoming} />
        ) : (
          <EmptyState
            title="No upcoming events are posted right now."
            description={
              // Point to past events only when the page shows some (#206)
              past.totalDocs > 0
                ? 'Check back soon, or browse past events below to see what neighbors have been up to.'
                : 'Check back soon.'
            }
          />
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
