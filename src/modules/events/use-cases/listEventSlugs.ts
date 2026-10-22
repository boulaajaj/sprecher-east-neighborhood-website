import 'server-only'

import type { EventSitemapEntry } from '../domain/types'
import * as queries from '../data/queries'

/** Every published event's slug and last edit, for static pages and the sitemap. */
export function listEventSlugs(): Promise<EventSitemapEntry[]> {
  return queries.listEventSlugs()
}
