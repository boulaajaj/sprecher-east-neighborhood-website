import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

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
      revalidateTag('events')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old event at /events/${previousDoc.slug}`)
      revalidatePath(`/events/${previousDoc.slug}`)
      revalidatePath('/events')
      revalidateTag('events')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/events/${doc.slug}`)
    revalidatePath('/events')
    revalidateTag('events')
  }

  return doc
}
