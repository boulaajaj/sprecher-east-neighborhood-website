'use client'

import React, { useCallback } from 'react'

import { LoadMoreFooter, useLoadMore } from '@/platform/ui/LoadMore.client'
import type { FeedPage } from '@/platform/lib'

import { loadEventsPage } from '../actions'
import type { EventSummary } from '../domain/types'
import type { EventScope } from '../domain/scope'
import { EventCard } from './EventCard'
import { CardGrid, CardGridItem } from '@/platform/ui/CardGrid'

/** Upcoming or past events grid that loads more events as the reader scrolls. */
export const EventsFeed: React.FC<{
  scope: EventScope
  initial: FeedPage<EventSummary>
}> = ({ scope, initial }) => {
  const load = useCallback((page: number) => loadEventsPage(scope, page), [scope])
  const feed = useLoadMore(initial, load)
  const compact = scope === 'past'

  return (
    <>
      <CardGrid gap={compact ? 'sm' : 'md'}>
        {feed.items.map((event) => (
          <CardGridItem key={event.id}>
            <EventCard event={event} compact={compact} />
          </CardGridItem>
        ))}
      </CardGrid>
      <LoadMoreFooter
        noun={scope === 'upcoming' ? 'upcoming events' : 'past events'}
        shownCount={feed.items.length}
        firstItemNumber={feed.firstItemNumber}
        totalDocs={feed.totalDocs}
        hasMore={feed.hasMore}
        status={feed.status}
        autoLoad={feed.autoLoad}
        onLoadMore={feed.loadMore}
        fallbackHref={`/events/list/${scope}/${feed.page + 1}`}
      />
    </>
  )
}
