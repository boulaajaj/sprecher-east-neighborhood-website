import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * The no-JavaScript list pages (/events/list/<scope>/<n>) are cached per URL; refresh them all
 * together with /events, so page 2+ never disagrees with page 1 after an edit. A route pattern
 * must name the route group: Next tags cached pages with their app path, (frontend) included.
 */
const revalidateEventLists = () => revalidatePath('/(frontend)/events/list/[scope]/[page]', 'page')

export const revalidateEvent: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating event at /events/${doc.slug}`)
      revalidatePath(`/events/${doc.slug}`)
      revalidatePath('/events')
      revalidateEventLists()
      revalidateTag('events')
      revalidateTag('events-sitemap')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old event at /events/${previousDoc.slug}`)
      revalidatePath(`/events/${previousDoc.slug}`)
      revalidatePath('/events')
      revalidateEventLists()
      revalidateTag('events')
      revalidateTag('events-sitemap')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/events/${doc.slug}`)
    revalidatePath('/events')
    revalidateEventLists()
    revalidateTag('events')
    revalidateTag('events-sitemap')
  }

  return doc
}
