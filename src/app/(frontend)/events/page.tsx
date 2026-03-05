import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { startOfToday } from '@/utilities/timezone'
import { EventCard } from '@/components/EventCard'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise })

  const events = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 50,
    sort: 'date',
    overrideAccess: false,
  })

  const todayCutoff = new Date(startOfToday())

  const upcoming = events.docs.filter((e) => new Date(e.date) >= todayCutoff)
  const past = events.docs.filter((e) => new Date(e.date) < todayCutoff).reverse()

  return (
    <div className="pb-24 pt-24">
      {/* Page header */}
      <div className="container mb-16">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
          Community Calendar
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Community Events
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Join your neighbors at upcoming events in the Sprecher East neighborhood.
        </p>
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div className="container mb-16">
          <h2 className="mb-8 text-2xl font-bold text-foreground">Upcoming Events</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="container mb-16">
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No upcoming events right now. Check back soon or follow us for updates!
            </p>
          </div>
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <div className="border-t border-border bg-surface py-16">
          <div className="container">
            <h2 className="mb-8 text-2xl font-bold text-muted-foreground">Past Events</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          </div>
        </div>
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
