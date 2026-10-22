import 'server-only'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Footer, Header } from '@/payload-types'

import { globalCacheTag } from '../domain/cacheTags'

/** A global with its links' pages populated, cached until an editor saves it. */
const cachedGlobal = <T extends 'header' | 'footer'>(slug: T) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      return payload.findGlobal({
        slug,
        depth: 1,
        // Keeps today's behavior: nav links populate whether or not their page is published
        // yet, since nothing revalidates the header or footer when a page is published (#251)
        overrideAccess: true,
      })
    },
    [slug],
    { tags: [globalCacheTag(slug)] },
  )

/** The header's nav links. */
export const getHeader = (): Promise<Header> => cachedGlobal('header')()

/** The footer's nav links. */
export const getFooter = (): Promise<Footer> => cachedGlobal('footer')()
