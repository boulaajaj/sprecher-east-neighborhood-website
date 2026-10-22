'use client'

import React from 'react'

import { LoadMoreFooter, useLoadMore } from '@/platform/ui/LoadMore.client'
import type { FeedPage } from '@/platform/lib'

import { loadPostsPage } from '../actions'
import type { PostSummary } from '../domain/types'
import { PostGrid } from './PostGrid'

/** News listing that loads more posts as the reader scrolls. */
export const PostsFeed: React.FC<{ initial: FeedPage<PostSummary> }> = ({ initial }) => {
  const feed = useLoadMore(initial, loadPostsPage)

  if (feed.totalDocs === 0) {
    return (
      <div className="container">
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-lg text-muted-foreground">No news posts yet. Check back soon.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PostGrid posts={feed.items} />
      <div className="container">
        <LoadMoreFooter
          noun="posts"
          shownCount={feed.items.length}
          firstItemNumber={feed.firstItemNumber}
          totalDocs={feed.totalDocs}
          hasMore={feed.hasMore}
          status={feed.status}
          autoLoad={feed.autoLoad}
          onLoadMore={feed.loadMore}
          fallbackHref={`/posts/page/${feed.page + 1}`}
        />
      </div>
    </>
  )
}
