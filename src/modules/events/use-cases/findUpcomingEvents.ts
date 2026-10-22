import 'server-only'

import { startOfToday } from '@/utilities/timezone'

import type { EventSummary } from '../domain/types'
import * as queries from '../data/queries'

/** How many upcoming events a sidebar lists. */
const SIDEBAR_COUNT = 3

/** The next few upcoming events, for a sidebar; `excludeId` leaves out the event being shown. */
export function findUpcomingEvents({
  limit = SIDEBAR_COUNT,
  excludeId,
}: { limit?: number; excludeId?: number } = {}): Promise<EventSummary[]> {
  return queries.findUpcomingEvents({ today: startOfToday(), limit, excludeId })
}
