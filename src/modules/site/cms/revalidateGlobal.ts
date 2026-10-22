import type { GlobalAfterChangeHook } from 'payload'

import { expireCacheTag } from '@/platform/payload/expireCacheTag'

import { globalCacheTag } from '../domain/cacheTags'

/** After the header or footer is saved, the next visitor gets it fresh. */
export const revalidateGlobal =
  (slug: 'header' | 'footer'): GlobalAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`Revalidating ${slug}`)

      expireCacheTag(globalCacheTag(slug))
    }

    return doc
  }
