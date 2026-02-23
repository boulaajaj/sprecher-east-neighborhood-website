import Link from 'next/link'
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14">

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
              <div className="bg-white rounded-2xl border border-border p-8 text-center">
                <div className="text-3xl mb-3">📅</div>
                <p className="font-semibold text-foreground mb-1">No upcoming events</p>
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
