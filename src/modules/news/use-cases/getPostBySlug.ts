import 'server-only'

import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { PostDetail } from '../domain/types'
import * as queries from '../data/queries'

/**
 * The post at `slug`, or `null`: its latest draft in draft mode (editors' preview), otherwise
 * the published version. Cached per request, so the page and its metadata query once.
 */
export const getPostBySlug = cache(async (slug: string): Promise<PostDetail | null> => {
  const { isEnabled: draft } = await draftMode()
  return queries.getPostBySlug(slug, { draft })
})
