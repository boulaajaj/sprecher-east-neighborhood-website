import React from 'react'

import type { PostSummary } from '@/modules/news'
import { PostGrid } from '@/modules/news/server'
import type { Post } from '@/payload-types'
import { toImageRef } from '@/platform/payload/imageRef'

/**
 * Temporary bridge for the search page only (#132). It still queries the search collection
 * itself and passes the results as card-shaped documents; the post grid now lives in
 * `src/modules/news`. Search moves into the news module once #223 (which edits the search page)
 * has merged, and this file and `components/Card` go then.
 */
export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'publishedAt'>

function toPostSummary(doc: CardPostData, index: number): PostSummary {
  return {
    id: index,
    slug: doc.slug,
    title: doc.title,
    publishedAt: doc.publishedAt ?? null,
    categories: (doc.categories ?? []).flatMap((category) =>
      typeof category === 'object'
        ? [{ id: category.id, title: category.title || 'Untitled category' }]
        : [],
    ),
    description: doc.meta?.description ?? null,
    image: toImageRef(doc.meta?.image),
  }
}

export const CollectionArchive: React.FC<{ posts: CardPostData[] }> = ({ posts }) => (
  <PostGrid posts={posts.map(toPostSummary)} />
)
