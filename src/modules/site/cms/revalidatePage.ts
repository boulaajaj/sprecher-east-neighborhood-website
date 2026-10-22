import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import { documentHref } from '@/platform/payload/documentHref'
import { expireCacheTag } from '@/platform/payload/expireCacheTag'

import type { Page } from '@/payload-types'

import { PAGES_SITEMAP_CACHE_TAG } from '../domain/cacheTags'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = documentHref('pages', doc.slug ?? '')

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      expireCacheTag(PAGES_SITEMAP_CACHE_TAG)
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = documentHref('pages', previousDoc.slug ?? '')

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      expireCacheTag(PAGES_SITEMAP_CACHE_TAG)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = documentHref('pages', doc?.slug ?? '')
    revalidatePath(path)
    expireCacheTag(PAGES_SITEMAP_CACHE_TAG)
  }

  return doc
}
