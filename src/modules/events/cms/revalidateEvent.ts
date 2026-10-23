import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

import { expireCacheTag } from '@/platform/payload/expireCacheTag'

import { EVENTS_SITEMAP_CACHE_TAG } from '../domain/cacheTags'

/**
 * Refreshes every cached page that shows the event at `slug`: its own page, /events, and the
 * no-JavaScript list pages (/events/list/<scope>/<n>), which are cached per URL and refreshed all
 * together so page 2+ never disagrees with page 1 after an edit. A route pattern must name the
 * route group: Next tags cached pages with their app path, (frontend) included.
 */
function revalidateEventPages(slug: string) {
  revalidatePath(`/events/${slug}`)
  revalidatePath('/events')
  revalidatePath('/(frontend)/events/list/[scope]/[page]', 'page')
  expireCacheTag('events')
  expireCacheTag(EVENTS_SITEMAP_CACHE_TAG)
}

export const revalidateEvent: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating event at /events/${doc.slug}`)
      revalidateEventPages(doc.slug)
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old event at /events/${previousDoc.slug}`)
      revalidateEventPages(previousDoc.slug)
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateEventPages(doc.slug)

  return doc
}
