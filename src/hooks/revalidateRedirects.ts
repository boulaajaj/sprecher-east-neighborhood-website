import type { CollectionAfterChangeHook } from 'payload'

import { expireCacheTag } from '@/platform/payload/expireCacheTag'

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  expireCacheTag('redirects')

  return doc
}
