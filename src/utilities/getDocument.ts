import 'server-only'

import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Collection = keyof Config['collections']

/**
 * A document by ID, as a visitor may see it: access rules apply, so a draft or a document the
 * visitor can't read comes back as null instead of leaking through a redirect.
 */
async function getDocument(collection: Collection, id: number | string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  return payload.findByID({ collection, id, depth, overrideAccess: false, disableErrors: true })
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the document
 */
export const getCachedDocument = (collection: Collection, id: number | string) =>
  unstable_cache(async () => getDocument(collection, id), [collection, String(id)], {
    tags: [`${collection}_${id}`],
  })
