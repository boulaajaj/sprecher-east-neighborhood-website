import type { Metadata } from 'next'
import Link from 'next/link'
import { getEvents, isUpcoming } from '@/lib/data'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { EventDetailCard } from '@/components/features/events/event-detail-card'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past events for the Sprecher East Neighborhood Association.',
}

export const revalidate = 3600

export default async function EventsPage() {
  const events = await getEvents()
  const upcoming = events.filter((e) => isUpcoming(e.date))
  const past = events.filter((e) => !isUpcoming(e.date))

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Events"
        description="Community meetings, public hearings, social gatherings, and more. Open to all Sprecher East residents."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <section id="upcoming" className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
            {upcoming.length > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                {upcoming.length}
              </span>
            )}
          </div>

          {upcoming.length > 0 ? (
            <div className="flex flex-col gap-4">
              {upcoming.map((event) => (
                <EventDetailCard key={event.id ?? event._id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📅"
              title="No upcoming events right now"
              description="Events are added as they're scheduled. Check back soon."
            />
          )}
        </section>

        <section className="mb-14 rounded-2xl border border-primary/20 bg-primary/8 p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="mb-1 font-bold text-foreground">Have an event to add?</h3>
              <p className="text-sm text-muted">Reach out and we'll get it on the calendar.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Suggest an Event
            </Link>
          </div>
        </section>

        {past.length > 0 && (
          <section id="past">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Past Events</h2>
            <div className="flex flex-col gap-4">
              {past.map((event) => (
                <EventDetailCard key={event.id ?? event._id} event={event} past />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
