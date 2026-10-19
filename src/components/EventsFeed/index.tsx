'use client'

import React, { useCallback } from 'react'

import { loadEventsPage } from '@/app/(frontend)/events/actions'
import { EventCard, type EventCardData } from '@/components/EventCard'
import { LoadMoreFooter, useLoadMore } from '@/components/LoadMore'
import type { EventScope, FeedPage } from '@/utilities/feeds'
import { cn } from '@/utilities/ui'

/** Upcoming or past events grid that loads more events as the reader scrolls. */
export const EventsFeed: React.FC<{
  scope: EventScope
  initial: FeedPage<EventCardData>
}> = ({ scope, initial }) => {
  const load = useCallback((page: number) => loadEventsPage(scope, page), [scope])
  const feed = useLoadMore(initial, load)
  const compact = scope === 'past'

  return (
    <>
      <ul className={cn('grid sm:grid-cols-2 lg:grid-cols-3', compact ? 'gap-4' : 'gap-6')}>
        {feed.items.map((event) => (
          <li key={event.id} className="flex min-w-0">
            <div className="w-full min-w-0">
              <EventCard event={event} compact={compact} />
            </div>
          </li>
        ))}
      </ul>
      <LoadMoreFooter
        noun={scope === 'upcoming' ? 'upcoming events' : 'past events'}
        shownCount={feed.items.length}
        firstItemNumber={feed.firstItemNumber}
        totalDocs={feed.totalDocs}
        hasMore={feed.hasMore}
        status={feed.status}
        autoLoad={feed.autoLoad}
        onLoadMore={feed.loadMore}
      />
    </>
  )
}
