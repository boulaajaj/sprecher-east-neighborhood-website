import { revalidateTag } from 'next/cache'

/**
 * Drops a cache tag now, so the next visitor gets fresh content. Payload hooks run outside server
 * actions, where `updateTag` isn't available; this is what `revalidateTag(tag)` did before Next 16.
 */
export const expireCacheTag = (tag: string): void => revalidateTag(tag, { expire: 0 })
