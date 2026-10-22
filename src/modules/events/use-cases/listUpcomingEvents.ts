import 'server-only'

import { startOfToday } from '@/utilities/timezone'

import type { EventSummary } from '../domain/types'
import { findUpcomingEvents } from '../data/queries'

/** How many upcoming events a sidebar lists. */
const SIDEBAR_COUNT = 3

/** The next few upcoming events, for a sidebar; `excludeId` leaves out the event being shown. */
export function listUpcomingEvents({
  limit = SIDEBAR_COUNT,
  excludeId,
}: { limit?: number; excludeId?: number } = {}): Promise<EventSummary[]> {
  return findUpcomingEvents({ today: startOfToday(), limit, excludeId })
}
