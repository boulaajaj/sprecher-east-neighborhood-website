import 'server-only'

import type { FeedMore, SortCursor } from '@/platform/lib'

import type { PostSummary } from '../domain/types'
import * as queries from '../data/queries'

/** The published posts after `cursor` in the news listing ("Load more"). */
export function findPostsAfter(cursor: SortCursor): Promise<FeedMore<PostSummary>> {
  return queries.findPostsAfter(cursor)
}
