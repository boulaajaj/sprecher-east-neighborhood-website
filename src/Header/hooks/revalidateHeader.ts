import type { GlobalAfterChangeHook } from 'payload'

import { expireCacheTag } from '@/platform/payload/expireCacheTag'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    expireCacheTag('global_header')
  }

  return doc
}
