import 'server-only'

import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Page } from '@/payload-types'

import { type PageLayoutBlock, toPageHeroProps, toPageLayout } from '../data/mappers'
import * as pages from '../data/pages'
import type { PageHeroProps } from '../domain/hero'

export type { PageLayoutBlock } from '../data/mappers'

/**
 * A page as the site draws it: its hero (`null` when it draws none) and its layout, with site's own
 * blocks, as plain props (0013).
 */
export type SitePage = Omit<Page, 'hero' | 'layout'> & {
  hero: PageHeroProps | null
  layout: PageLayoutBlock[]
}

/**
 * A stored hero as the site draws it, for a page that doesn't come from the database: the starter
 * home page shown before the seed.
 */
export function toSiteHero(hero: Page['hero']): PageHeroProps | null {
  return toPageHeroProps(hero)
}

/**
 * The page at `slug`, or `null`: its latest draft in draft mode (editors' preview), otherwise
 * the published version. Cached per request, so the page and its metadata query once.
 */
export const getPageBySlug = cache(async (slug: string): Promise<SitePage | null> => {
  const { isEnabled: draft } = await draftMode()
  const page = await pages.getPageBySlug(slug, { draft })
  return page && { ...page, hero: toPageHeroProps(page.hero), layout: toPageLayout(page.layout) }
})
