import type { CollectionAfterChangeHook } from 'payload'

import { expireCacheTag } from '@/platform/payload/expireCacheTag'

import { REDIRECTS_CACHE_TAG } from '../domain/cacheTags'

/** After a redirect is saved, the site follows the new list on the next request. */
export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  expireCacheTag(REDIRECTS_CACHE_TAG)

  return doc
}
