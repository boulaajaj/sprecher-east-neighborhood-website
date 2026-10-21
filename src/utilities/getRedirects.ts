import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export async function getRedirects() {
  const payload = await getPayload({ config: configPromise })

  const { docs: redirects } = await payload.find({
    collection: 'redirects',
    // References stay IDs: PayloadRedirects looks each target up as a visitor, so drafts stay hidden
    depth: 0,
    limit: 0,
    pagination: false,
    // Redirects are admin-only in the admin panel; the site still has to read them to follow them
    overrideAccess: true,
  })

  return redirects
}

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
export const getCachedRedirects = () =>
  unstable_cache(async () => getRedirects(), ['redirects'], {
    tags: ['redirects'],
  })
