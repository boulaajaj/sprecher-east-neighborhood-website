import 'server-only'

import type { PageSitemapEntry } from '../domain/types'
import * as pages from '../data/pages'

/** Every published page's slug and last edit, for static pages and the sitemap. */
export function listPageSlugs(): Promise<PageSitemapEntry[]> {
  return pages.listPageSlugs()
}
