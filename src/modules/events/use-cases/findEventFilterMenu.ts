import 'server-only'

import { cache } from 'react'

import { startOfToday } from '@/platform/lib/timezone'

import {
  findFilter,
  isCategorySlug,
  type EventCategoryFilter,
  type EventFilterMenu,
} from '../domain/filters'
import * as categories from '../data/categories'

/**
 * The filter row of /events: the categories with published events and every count, as of today in
 * the site timezone. Cached per request, so the layout, the page and its metadata read it once.
 */
export const findEventFilterMenu = cache(
  (): Promise<EventFilterMenu> => categories.findEventFilterMenu(startOfToday()),
)

/**
 * The filter category with `slug`, from a URL or a client request, or `null` when it isn't the
 * slug of a category with published events (#122).
 */
export async function findEventCategory(slug: unknown): Promise<EventCategoryFilter | null> {
  // A malformed slug is refused before any query
  if (!isCategorySlug(slug)) return null
  return findFilter((await findEventFilterMenu()).categories, slug)
}
