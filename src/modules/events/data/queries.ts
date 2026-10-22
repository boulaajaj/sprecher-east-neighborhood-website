import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { FeedPage } from '@/platform/lib'
import { PUBLISHED } from '@/platform/payload/published'

import type { EventScope } from '../domain/scope'
import type { EventDetail, EventSitemapEntry, EventSummary } from '../domain/types'
import { SUMMARY_FIELDS, toEventDetail, toEventSummary } from './mappers'
import { inScope } from './scope'

const UPCOMING_EVENTS_PAGE_SIZE = 12
const PAST_EVENTS_PAGE_SIZE = 9

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
  const limit = scope === 'upcoming' ? UPCOMING_EVENTS_PAGE_SIZE : PAST_EVENTS_PAGE_SIZE

  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit,
    page,
    sort: scope === 'upcoming' ? 'date' : '-date',
    overrideAccess: false,
    where: { and: [PUBLISHED, inScope(scope, today)] },
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
        PUBLISHED,
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
export async function listEventSlugs(): Promise<EventSitemapEntry[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    where: PUBLISHED,
    select: { slug: true, updatedAt: true },
  })

  return result.docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}
