import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { CardPostData } from '@/components/Card'
import type { FeedPage } from '@/platform/lib'
import { PUBLISHED } from '@/platform/payload/published'

/**
 * Server-side query behind the incrementally loaded /posts listing. The page calls it for the
 * first page and the server action for the next pages, so both return the same shape and
 * filters. Events have their own in src/modules/events (#131); this moves to news in #132.
 */

export const POSTS_PAGE_SIZE = 12

export type PostFeedItem = CardPostData & { id: number | string }

export async function findPublishedPosts(page: number): Promise<FeedPage<PostFeedItem>> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PAGE_SIZE,
    page,
    sort: '-publishedAt',
    overrideAccess: false,
    where: PUBLISHED,
    select: {
      title: true,
      slug: true,
      categories: true,
      publishedAt: true,
      meta: true,
    },
  })

  return {
    docs: result.docs as PostFeedItem[],
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    limit: POSTS_PAGE_SIZE,
  }
}
