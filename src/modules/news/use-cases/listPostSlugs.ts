import 'server-only'

import type { PostSitemapEntry } from '../domain/types'
import * as queries from '../data/queries'

/** Every published post's slug and last edit, for static pages and the sitemap. */
export function listPostSlugs(): Promise<PostSitemapEntry[]> {
  return queries.listPostSlugs()
}
