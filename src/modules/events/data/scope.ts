import 'server-only'

import type { Where } from 'payload'

import type { EventScope } from '../domain/scope'

/**
 * The upcoming rule, as the query that applies it: upcoming events are dated on or after
 * `today`, past events before it. Event dates are day-only (midnight UTC), and `today` is the
 * site-timezone date as midnight UTC (`startOfToday()`), so an event stays upcoming until
 * midnight in Madison, not midnight UTC.
 */
export function inScope(scope: EventScope, today: string): Where {
  return scope === 'upcoming'
    ? { date: { greater_than_equal: today } }
    : { date: { less_than: today } }
}
