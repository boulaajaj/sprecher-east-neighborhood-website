import 'server-only'

import type { FeedPage } from '@/platform/lib'
import { startOfToday } from '@/platform/lib/timezone'

import type { EventScope } from '../domain/scope'
import type { EventSummary } from '../domain/types'
import * as queries from '../data/queries'

/** One page of the upcoming or past listing, as of today in the site timezone. */
export function findEventPage(scope: EventScope, page: number): Promise<FeedPage<EventSummary>> {
  return queries.findEventPage(scope, page, startOfToday())
}
