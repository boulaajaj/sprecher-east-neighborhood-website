import 'server-only'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Redirect } from '@/payload-types'

import { REDIRECTS_CACHE_TAG } from '../domain/cacheTags'

/** Every redirect editors set, cached together until one is saved. */
export const listRedirects: () => Promise<Redirect[]> = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
      collection: 'redirects',
      // References stay IDs: the target is looked up as a visitor, so drafts stay hidden
      depth: 0,
      limit: 0,
      pagination: false,
      // Redirects are admin-only in the admin panel; the site still has to read them to follow them
      overrideAccess: true,
    })

    return docs
  },
  ['redirects'],
  { tags: [REDIRECTS_CACHE_TAG] },
)
