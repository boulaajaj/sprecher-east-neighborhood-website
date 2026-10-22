import 'server-only'

import type { Where } from 'payload'

import { PUBLISHED } from '@/platform/payload/published'

/**
 * The search rule, as the filter that applies it: a search entry (a post or an event) matches
 * when its title, slug, or search-engine title or description contains `query`. An empty query
 * has no filter, so every entry is listed.
 */
export function searchMatch(query: string): Where | undefined {
  if (!query) return undefined

  return {
    or: [
      { title: { like: query } },
      { 'meta.description': { like: query } },
      { 'meta.title': { like: query } },
      { slug: { like: query } },
    ],
  }
}

/**
 * Which posts "latest" lists may show: published ones, leaving out `excludeIds` ("You May Also
 * Like" leaves out the post and its related posts), and only those in one of `categoryIds` when
 * any are given (an archive block limited to some categories).
 */
export function latestPostsWhere({
  excludeIds = [],
  categoryIds = [],
}: {
  excludeIds?: number[]
  categoryIds?: number[]
}): Where {
  return {
    and: [
      PUBLISHED,
      ...(excludeIds.length > 0 ? [{ id: { not_in: excludeIds } }] : []),
      ...(categoryIds.length > 0 ? [{ categories: { in: categoryIds } }] : []),
    ],
  }
}
