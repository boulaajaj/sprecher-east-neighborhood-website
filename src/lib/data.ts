/**
 * Data abstraction layer.
 *
 * Currently reads from static JSON files so the site works with zero config.
 * When you're ready to switch to Sanity CMS:
 *   1. Create a Sanity project (sanity.io)
 *   2. Copy .env.local.example → .env.local and fill in your project ID
 *   3. Push your content via `npx sanity@latest dataset import`
 *   4. Uncomment the Sanity branches below and delete the JSON imports
 */

import type { Event, Post, BoardMember } from './types'

// ─── JSON fallback (works without any CMS setup) ────────────────────────────

async function getEventsFromJson(): Promise<Event[]> {
  const data = await import('../../data/events.json')
  // JSON shape: { "events": [...] }
  const raw = data.default as { events: Event[] }
  return Array.isArray(raw) ? raw : (raw.events ?? [])
}

async function getPostsFromJson(): Promise<Post[]> {
  const data = await import('../../data/posts.json')
  // JSON shape: { "posts": [...] }
  const raw = data.default as { posts: Post[] }
  return Array.isArray(raw) ? raw : (raw.posts ?? [])
}

async function getBoardFromJson(): Promise<BoardMember[]> {
  const data = await import('../../data/board.json')
  // JSON shape: { "board": [...] }
  const raw = data.default as { board: BoardMember[] }
  return Array.isArray(raw) ? raw : (raw.board ?? [])
}

// ─── Sanity (uncomment when CMS is configured) ───────────────────────────────

// async function getEventsFromSanity(): Promise<Event[]> {
//   const { client } = await import('@/sanity/lib/client')
//   const { eventsQuery } = await import('@/sanity/lib/queries')
//   return client.fetch(eventsQuery)
// }

// async function getPostsFromSanity(): Promise<Post[]> {
//   const { client } = await import('@/sanity/lib/client')
//   const { postsQuery } = await import('@/sanity/lib/queries')
//   return client.fetch(postsQuery)
// }

// async function getBoardFromSanity(): Promise<BoardMember[]> {
//   const { client } = await import('@/sanity/lib/client')
//   const { boardQuery } = await import('@/sanity/lib/queries')
//   return client.fetch(boardQuery)
// }

// ─── Public API ──────────────────────────────────────────────────────────────

const useSanity = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

export async function getEvents(): Promise<Event[]> {
  if (!useSanity) return getEventsFromJson()
  const { client } = await import('@/sanity/lib/client')
  const { eventsQuery } = await import('@/sanity/lib/queries')
  return client.fetch(eventsQuery) as Promise<Event[]>
}

export async function getPosts(): Promise<Post[]> {
  if (!useSanity) return getPostsFromJson()
  const { client } = await import('@/sanity/lib/client')
  const { postsQuery } = await import('@/sanity/lib/queries')
  return client.fetch(postsQuery) as Promise<Post[]>
}

export async function getBoardMembers(): Promise<BoardMember[]> {
  if (!useSanity) return getBoardFromJson()
  const { client } = await import('@/sanity/lib/client')
  const { boardQuery } = await import('@/sanity/lib/queries')
  return client.fetch(boardQuery) as Promise<BoardMember[]>
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
