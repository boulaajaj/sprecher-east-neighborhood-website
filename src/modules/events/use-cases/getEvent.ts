import 'server-only'

import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { EventDetail } from '../domain/types'
import { getEventBySlug } from '../data/queries'

/**
 * The event at `slug`, or `null`: its latest draft in draft mode (editors' preview), otherwise
 * the published version. Cached per request, so the page and its metadata query once.
 */
export const getEvent = cache(async (slug: string): Promise<EventDetail | null> => {
  const { isEnabled: draft } = await draftMode()
  return getEventBySlug(slug, { draft })
})
