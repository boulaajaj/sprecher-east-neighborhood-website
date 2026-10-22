import 'server-only'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

/** The collections a redirect may point at. */
type Target = 'pages' | 'posts'

/**
 * A page or post by ID, as a visitor may see it: access rules apply, so a draft or a document the
 * visitor can't read comes back as null instead of leaking through a redirect. Cached for 10
 * minutes.
 */
export const getDocumentById = <T extends Target>(collection: T, id: number) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      return payload.findByID({
        collection,
        id,
        depth: 0,
        overrideAccess: false,
        disableErrors: true,
      })
    },
    [collection, String(id)],
    {
      tags: [`${collection}_${id}`],
      // Nothing revalidates these tags yet, so a published or renamed target shows up within 10 minutes
      revalidate: 600,
    },
  )()
