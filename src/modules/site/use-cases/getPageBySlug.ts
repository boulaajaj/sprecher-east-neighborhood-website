import 'server-only'

import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Page } from '@/payload-types'

import { type PageLayoutBlock, toPageLayout } from '../data/mappers'
import * as pages from '../data/pages'

export type { PageLayoutBlock } from '../data/mappers'

/** A page as the site draws it: its layout with site's own blocks as plain props (0013). */
export type SitePage = Omit<Page, 'layout'> & { layout: PageLayoutBlock[] }

/**
 * The page at `slug`, or `null`: its latest draft in draft mode (editors' preview), otherwise
 * the published version. Cached per request, so the page and its metadata query once.
 */
export const getPageBySlug = cache(async (slug: string): Promise<SitePage | null> => {
  const { isEnabled: draft } = await draftMode()
  const page = await pages.getPageBySlug(slug, { draft })
  return page && { ...page, layout: toPageLayout(page.layout) }
})
