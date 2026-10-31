import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Page } from '@/payload-types'
import { PUBLISHED } from '@/platform/payload/published'

import type { PageSitemapEntry } from '../domain/types'

/** The page at `slug`, or `null`: its latest draft when `draft`, otherwise the published one. */
export async function getPageBySlug(
  slug: string,
  { draft }: { draft: boolean },
): Promise<Page | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    // Editors previewing a draft see it; visitors get what access allows (published pages)
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })

  return result.docs[0] ?? null
}

/** Every published page's slug and last edit. */
export async function listPageSlugs(): Promise<PageSitemapEntry[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    where: PUBLISHED,
    select: { slug: true, updatedAt: true },
  })

  return result.docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}
