import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

import { expireCacheTag } from '@/platform/payload/expireCacheTag'

/**
 * Hooks that refresh the one page listing a collection (`/faq`, `/resources`, and the cache tag of
 * the same name) after any save or delete. Drafts refresh it too, which costs one render: the
 * page shows only published entries.
 */
export function revalidateListPage(page: 'faq' | 'resources') {
  const refresh = () => {
    revalidatePath(`/${page}`)
    expireCacheTag(page)
  }

  const afterChange: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`Revalidating /${page}`)
      refresh()
    }

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
    if (!context.disableRevalidate) refresh()

    return doc
  }

  return { afterChange, afterDelete }
}
