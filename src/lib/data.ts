/**
 * Data abstraction layer.
 *
 * Reads from Payload CMS (SQLite) when available.
 * Falls back to static JSON files so the site works during initial setup
 * or if the database has not been seeded yet.
 */

import type { Event, Post, BoardMember } from './types'

// ─── Payload CMS (primary source) ────────────────────────────────────────────

async function getEventsFromPayload(): Promise<Event[]> {
  const { getPayload } = await import('payload')
  const config = await import('@payload-config')
  const payload = await getPayload({ config: config.default })
  const { docs } = await payload.find({
    collection: 'events',
    sort: '-date',
    limit: 200,
    overrideAccess: true,
  })
  return docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    date: typeof doc.date === 'string' ? doc.date.split('T')[0] : String(doc.date),
    timeStart: doc.timeStart ?? undefined,
    timeEnd: doc.timeEnd ?? undefined,
    category: doc.category as Event['category'],
    locationType: (doc.locationType as Event['locationType']) ?? 'in-person',
    locationName: doc.locationName ?? undefined,
    locationAddress: doc.locationAddress ?? undefined,
    locationCity: doc.locationCity ?? undefined,
    mapsUrl: doc.mapsUrl ?? undefined,
    registrationUrl: doc.registrationUrl ?? undefined,
    description: doc.description,
    featured: doc.featured ?? false,
  }))
}

async function getPostsFromPayload(): Promise<Post[]> {
  const { getPayload } = await import('payload')
  const config = await import('@payload-config')
  const payload = await getPayload({ config: config.default })
  const { docs } = await payload.find({
    collection: 'posts',
    sort: '-publishedAt',
    limit: 200,
    overrideAccess: true,
  })
  return docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    publishedAt: typeof doc.publishedAt === 'string' ? doc.publishedAt : String(doc.publishedAt),
    author: doc.author ?? 'SENA',
    category: doc.category ?? undefined,
    tags: Array.isArray(doc.tags)
      ? (doc.tags as { tag: string }[]).map((t) => t.tag).filter(Boolean)
      : [],
    featured: doc.featured ?? false,
    excerpt: doc.excerpt,
  }))
}

async function getBoardFromPayload(): Promise<BoardMember[]> {
  const { getPayload } = await import('payload')
  const config = await import('@payload-config')
  const payload = await getPayload({ config: config.default })
  const { docs } = await payload.find({
    collection: 'board-members',
    sort: 'order',
    limit: 100,
    overrideAccess: true,
  })
  return docs.map((doc) => ({
    id: String(doc.id),
    name: doc.name,
    role: doc.role,
    bio: doc.bio ?? undefined,
    email: doc.email ?? undefined,
    order: doc.order ?? 99,
  }))
}

// ─── JSON fallback (works without any CMS/DB setup) ──────────────────────────

async function getEventsFromJson(): Promise<Event[]> {
  const data = await import('../../data/events.json')
  const raw = data.default as { events: Event[] }
  return Array.isArray(raw) ? raw : (raw.events ?? [])
}

async function getPostsFromJson(): Promise<Post[]> {
  const data = await import('../../data/posts.json')
  const raw = data.default as { posts: Post[] }
  return Array.isArray(raw) ? raw : (raw.posts ?? [])
}

async function getBoardFromJson(): Promise<BoardMember[]> {
  const data = await import('../../data/board.json')
  const raw = data.default as { board: BoardMember[] }
  return Array.isArray(raw) ? raw : (raw.board ?? [])
}

// ─── Public API ──────────────────────────────────────────────────────────────

async function withJsonFallback<T>(
  primary: () => Promise<T[]>,
  fallback: () => Promise<T[]>,
): Promise<T[]> {
  try {
    return await primary()
  } catch {
    return fallback()
  }
}

export function getEvents(): Promise<Event[]> {
  return withJsonFallback(getEventsFromPayload, getEventsFromJson)
}

export function getPosts(): Promise<Post[]> {
  return withJsonFallback(getPostsFromPayload, getPostsFromJson)
}

export function getBoardMembers(): Promise<BoardMember[]> {
  return withJsonFallback(getBoardFromPayload, getBoardFromJson)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isUpcoming(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') >= today
}

export function getSlug(event: Event | Post): string {
  const s = event.slug
  return typeof s === 'string' ? s : s.current
}

export function getEventTime(event: Event): string {
  const start = event.timeStart ?? event.time_start
  const end = event.timeEnd ?? event.time_end
  if (!start) return ''
  return end ? `${start} – ${end}` : start
}

export function getEventLocationType(event: Event): 'virtual' | 'in-person' | 'hybrid' {
  return event.locationType ?? event.location?.type ?? 'in-person'
}

export function getEventLocationLabel(event: Event): string {
  const type = getEventLocationType(event)
  if (type === 'virtual') return 'Virtual / Online'
  const name = event.locationName ?? event.location?.name
  const city = event.locationCity ?? event.location?.city
  return name ?? city ?? 'Madison, WI'
}
