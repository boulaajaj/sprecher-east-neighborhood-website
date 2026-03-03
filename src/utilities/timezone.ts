/**
 * Timezone utilities for Sprecher East (Madison, WI — Central Time).
 *
 * The site serves a neighborhood in the America/Chicago timezone.
 * The VPS runs UTC, so all date comparisons for "today" must
 * explicitly target Central Time to avoid off-by-one-day errors.
 */

const TIMEZONE = 'America/Chicago'

/**
 * Returns an ISO string representing the start of today in Central Time.
 *
 * Event dates are stored as day-only (midnight UTC, e.g. "2026-03-03T00:00:00.000Z").
 * To determine if an event is "today or later" we need to know what date it is
 * right now in Central Time, then compare against that date at midnight UTC
 * (matching how Payload stores day-only dates).
 */
export function startOfTodayCentral(): string {
  const centralDate = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date())
  return `${centralDate}T00:00:00.000Z`
}
