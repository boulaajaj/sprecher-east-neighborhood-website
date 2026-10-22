import type { GlobalAfterChangeHook } from 'payload'

import { expireCacheTag } from '@/platform/payload/expireCacheTag'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    expireCacheTag('global_footer')
  }

  return doc
}
