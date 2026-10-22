import 'server-only'

import type { FeedPage } from '@/platform/lib'
import { startOfToday } from '@/utilities/timezone'

import type { EventSummary } from '../domain/types'
import type { EventScope } from '../domain/upcoming'
import { findEventPage } from '../data/queries'

/** One page of the upcoming or past listing, as of today in the site timezone. */
export function listEventPage(scope: EventScope, page: number): Promise<FeedPage<EventSummary>> {
  return findEventPage(scope, page, startOfToday())
}
