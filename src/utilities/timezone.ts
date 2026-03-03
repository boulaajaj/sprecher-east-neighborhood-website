/**
 * Timezone utilities for the site.
 *
 * SITE_TIMEZONE is read from the SITE_TIMEZONE env var, defaulting to
 * America/Chicago (Central Time). This is the single source of truth —
 * all date formatting and comparison helpers import from here.
 *
 * The VPS runs UTC, so all date comparisons for "today" must explicitly
 * target the site timezone to avoid off-by-one-day errors.
 */

export const SITE_TIMEZONE = process.env.SITE_TIMEZONE || 'America/Chicago'

/**
 * Returns an ISO string representing the start of today in the site timezone.
 *
 * Event dates are stored as day-only (midnight UTC, e.g. "2026-03-03T00:00:00.000Z").
 * To determine if an event is "today or later" we need to know what date it is
 * right now in the site timezone, then compare against that date at midnight UTC
 * (matching how Payload stores day-only dates).
 */
export function startOfToday(): string {
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIMEZONE }).format(new Date())
  return `${localDate}T00:00:00.000Z`
}
