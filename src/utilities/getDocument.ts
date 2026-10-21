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
async function getDocument<T extends Collection>(collection: T, id: number) {
  const payload = await getPayload({ config: configPromise })

  return payload.findByID({ collection, id, depth: 0, overrideAccess: false, disableErrors: true })
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the document
 */
export const getCachedDocument = <T extends Collection>(collection: T, id: number) =>
  unstable_cache(async () => getDocument(collection, id), [collection, String(id)], {
    tags: [`${collection}_${id}`],
    // Nothing revalidates these tags yet, so a published or renamed target shows up within 10 minutes
    revalidate: 600,
  })
