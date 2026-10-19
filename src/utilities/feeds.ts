import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import type { CardPostData } from '@/components/Card'
import type { EventCardData } from '@/components/EventCard'
import { startOfToday } from './timezone'

/**
 * Server-side queries behind the incrementally loaded listings (/posts, /events).
 * Pages call these for the first page; the matching server actions call them for
 * the next pages, so both paths return exactly the same shape and filters.
 */

export const POSTS_PAGE_SIZE = 12
export const UPCOMING_EVENTS_PAGE_SIZE = 12
export const PAST_EVENTS_PAGE_SIZE = 9

/** Highest page a client may request — a sanity bound, far above real content. */
const MAX_PAGE = 500

export type FeedPage<T> = {
  docs: T[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
}

export type PostFeedItem = CardPostData & { id: number | string }

export type EventScope = 'upcoming' | 'past'

/** Validates a page number coming from a URL or a client request. */
export function parsePageNumber(value: unknown): number | null {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : null
}

export function isEventScope(value: unknown): value is EventScope {
  return value === 'upcoming' || value === 'past'
}

// Always filter on _status explicitly. `overrideAccess: false` without a user already
// limits results to published documents, but this keeps drafts out even if a caller
// later passes a signed-in user (any signed-in user can read drafts via the access rule).
const published: Where = { _status: { equals: 'published' } }

export async function findPublishedPosts(page: number): Promise<FeedPage<PostFeedItem>> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PAGE_SIZE,
    page,
    sort: '-publishedAt',
    overrideAccess: false,
    where: published,
    select: {
      title: true,
      slug: true,
      categories: true,
      publishedAt: true,
      meta: true,
    },
  })

  return {
    docs: result.docs as PostFeedItem[],
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    limit: POSTS_PAGE_SIZE,
  }
}

export async function findPublishedEvents(
  scope: EventScope,
  page: number,
): Promise<FeedPage<EventCardData>> {
  const payload = await getPayload({ config: configPromise })
  const today = startOfToday()
  const limit = scope === 'upcoming' ? UPCOMING_EVENTS_PAGE_SIZE : PAST_EVENTS_PAGE_SIZE

  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit,
    page,
    // Upcoming: soonest first. Past: most recent first.
    sort: scope === 'upcoming' ? 'date' : '-date',
    overrideAccess: false,
    where: {
      and: [
        published,
        scope === 'upcoming'
          ? { date: { greater_than_equal: today } }
          : { date: { less_than: today } },
      ],
    },
    select: {
      title: true,
      slug: true,
      date: true,
      timeStart: true,
      timeEnd: true,
      category: true,
      description: true,
      locationName: true,
      heroImage: true,
    },
  })

  return {
    docs: result.docs as EventCardData[],
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    limit,
  }
}
