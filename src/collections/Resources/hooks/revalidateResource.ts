import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

import { expireCacheTag } from '@/utilities/expireCacheTag'

export const revalidateResource: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating resources page')
    revalidatePath('/resources')
    expireCacheTag('resources')
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath('/resources')
    expireCacheTag('resources')
  }

  return doc
}
