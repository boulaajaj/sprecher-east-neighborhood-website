import 'server-only'

import type { PostSummary } from '../domain/types'
import * as queries from '../data/queries'

/**
 * What the search page lists for `query` (already parsed with `parseSearchQuery`): matching
 * posts and events, or everything indexed when `query` is empty.
 */
export function findSearchResults(query: string): Promise<PostSummary[]> {
  return queries.findSearchResults(query)
}
