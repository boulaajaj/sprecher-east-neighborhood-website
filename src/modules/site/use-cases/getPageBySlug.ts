import 'server-only'

import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Page } from '@/payload-types'

import * as pages from '../data/pages'

/**
 * The page at `slug`, or `null`: its latest draft in draft mode (editors' preview), otherwise
 * the published version. Cached per request, so the page and its metadata query once.
 */
export const getPageBySlug = cache(async (slug: string): Promise<Page | null> => {
  const { isEnabled: draft } = await draftMode()
  return pages.getPageBySlug(slug, { draft })
})
