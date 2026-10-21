import type { GlobalAfterChangeHook } from 'payload'

import { expireCacheTag } from '@/utilities/expireCacheTag'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    expireCacheTag('global_footer')
  }

  return doc
}
