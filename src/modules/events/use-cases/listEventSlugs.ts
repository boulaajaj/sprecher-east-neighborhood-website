import 'server-only'

import type { EventSlug } from '../domain/types'
import { findEventSlugs } from '../data/queries'

/** Every published event's slug and last edit, for static pages and the sitemap. */
export function listEventSlugs(): Promise<EventSlug[]> {
  return findEventSlugs()
}
