import 'server-only'

import { recentPostExclusions } from '../domain/related'
import type { PostDetail, PostSummary } from '../domain/types'
import * as queries from '../data/queries'

/** How many posts "You May Also Like" lists. */
const RECENT_COUNT = 3

/** "You May Also Like" on a post's page: the newest posts the sidebar doesn't already list. */
export function findRecentPosts(post: PostDetail): Promise<PostSummary[]> {
  return queries.findLatestPosts({ limit: RECENT_COUNT, excludeIds: recentPostExclusions(post) })
}
