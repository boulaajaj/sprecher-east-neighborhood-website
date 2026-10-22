import 'server-only'

import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import type { FeedPage } from '@/platform/lib'

import type { EventDetail, EventSlug, EventSummary } from '../domain/types'
import type { EventScope } from '../domain/upcoming'
import { SUMMARY_FIELDS, toEventDetail, toEventSummary } from './mappers'

/** Events per page of each listing. */
const PAGE_SIZE: Record<EventScope, number> = { upcoming: 12, past: 9 }

// Always filter on _status explicitly. `overrideAccess: false` without a user already
// limits results to published documents, but this keeps drafts out even if a caller
// later passes a signed-in admin or editor (who can read drafts via the access rule).
const published: Where = { _status: { equals: 'published' } }

/** `isUpcoming` as a query: upcoming is on or after today, past is before it. */
function inScope(scope: EventScope, today: string): Where {
  return scope === 'upcoming'
    ? { date: { greater_than_equal: today } }
    : { date: { less_than: today } }
}

/**
 * One page of published upcoming events (soonest first) or past events (most recent first).
 * `today` is the site-timezone date as midnight UTC (`startOfToday()`).
 */
export async function findEventPage(
  scope: EventScope,
  page: number,
  today: string,
): Promise<FeedPage<EventSummary>> {
  const payload = await getPayload({ config: configPromise })
  const limit = PAGE_SIZE[scope]

  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit,
    page,
    sort: scope === 'upcoming' ? 'date' : '-date',
    overrideAccess: false,
    where: { and: [published, inScope(scope, today)] },
    select: SUMMARY_FIELDS,
  })

  return {
    docs: result.docs.map(toEventSummary),
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    limit,
  }
}

/** The next published upcoming events, soonest first, leaving out `excludeId` if given. */
export async function findUpcomingEvents({
  today,
  limit,
  excludeId,
}: {
  today: string
  limit: number
  excludeId?: number
}): Promise<EventSummary[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit,
    sort: 'date',
    overrideAccess: false,
    where: {
      and: [
        published,
        inScope('upcoming', today),
        ...(excludeId === undefined ? [] : [{ id: { not_equals: excludeId } }]),
      ],
    },
    select: SUMMARY_FIELDS,
  })

  return result.docs.map(toEventSummary)
}

/**
 * The event at `slug`, or `null`. With `draft`, the latest draft, read past access control so
 * editors can preview it; otherwise only what a visitor may see.
 */
export async function getEventBySlug(
  slug: string,
  { draft }: { draft: boolean },
): Promise<EventDetail | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  const doc = result.docs[0]
  return doc ? toEventDetail(doc) : null
}

/** Every published event's slug and last edit. */
export async function findEventSlugs(): Promise<EventSlug[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    where: published,
    select: { slug: true, updatedAt: true },
  })

  return result.docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}
