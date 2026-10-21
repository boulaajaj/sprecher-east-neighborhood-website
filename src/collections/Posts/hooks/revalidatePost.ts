import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import { expireCacheTag } from '@/utilities/expireCacheTag'

import type { Post } from '../../../payload-types'

/**
 * News listings built from the published-posts feed: /posts, its numbered no-JavaScript pages,
 * and the home page's "Recent News" block. Refresh them when a post is published, changed,
 * unpublished or deleted, instead of waiting for the 10-minute ISR window.
 */
const revalidatePostLists = () => {
  revalidatePath('/posts')
  // A route pattern must name the route group (Next tags cached pages with their app path)
  revalidatePath('/(frontend)/posts/page/[pageNumber]', 'page')
  revalidatePath('/')
}

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/posts/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${path}`)

      revalidatePath(path)
      revalidatePostLists()
      expireCacheTag('posts-sitemap')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePostLists()
      expireCacheTag('posts-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`

    revalidatePath(path)
    revalidatePostLists()
    expireCacheTag('posts-sitemap')
  }

  return doc
}
