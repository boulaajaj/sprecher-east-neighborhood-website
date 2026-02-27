import type { Event, Post } from '@/lib/types'
import { EventList } from '@/components/features/events/event-list'
import { PostFeed } from '@/components/features/posts/post-feed'
import { SectionHeader } from '@/components/ui/section-header'

interface EventsNewsProps {
  upcomingEvents: Event[]
  recentPosts: Post[]
}

export function EventsNews({ upcomingEvents, recentPosts }: EventsNewsProps) {
  return (
    <section className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-14">
          <div>
            <SectionHeader
              eyebrow="Upcoming Events"
              title="What's Coming Up"
              viewAllHref="/events"
              viewAllLabel="View all"
            />
            <EventList
              events={upcomingEvents}
              emptyMessage="Check back soon — more events are planned."
            >
              <div className="rounded-2xl border border-border bg-white p-8 text-center">
                <div className="mb-3 text-3xl">📅</div>
                <p className="mb-1 font-semibold text-foreground">No upcoming events</p>
                <p className="text-sm text-muted">Check back soon — more events are planned.</p>
              </div>
            </EventList>
          </div>

          <div>
            <SectionHeader
              eyebrow="Latest News"
              title="Neighborhood Updates"
              viewAllHref="/news"
              viewAllLabel="All news"
            />
            <PostFeed posts={recentPosts} />
          </div>
        </div>
      </div>
    </section>
  )
}
