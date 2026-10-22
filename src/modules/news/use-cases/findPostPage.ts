import 'server-only'

import type { FeedPage } from '@/platform/lib'

import type { PostSummary } from '../domain/types'
import * as queries from '../data/queries'

/** One page of the news listing: published posts, newest first. */
export function findPostPage(page: number): Promise<FeedPage<PostSummary>> {
  return queries.findPostPage(page)
}
