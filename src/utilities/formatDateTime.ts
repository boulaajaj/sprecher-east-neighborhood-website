import { SITE_TIMEZONE } from './timezone'

const DAY_ONLY_SUFFIX = 'T00:00:00.000Z'

/**
 * Picks the correct timezone for formatting.
 * Day-only dates (stored as midnight UTC by Payload's dayOnly picker) must
 * be formatted in UTC so "2026-03-03T00:00:00.000Z" displays as Mar 3,
 * not Mar 2 (which is what the site timezone would show for midnight UTC).
 */
function resolveTimezone(timestamp: string): string {
  return timestamp.endsWith(DAY_ONLY_SUFFIX) ? 'UTC' : SITE_TIMEZONE
}

export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp)

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: resolveTimezone(timestamp),
  })
}

export const formatDateShort = (timestamp: string): string => {
  const date = new Date(timestamp)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: resolveTimezone(timestamp),
  })
}

export const formatDateBadge = (timestamp: string): { month: string; day: string } => {
  const date = new Date(timestamp)
  const tz = resolveTimezone(timestamp)

  return {
    month: date.toLocaleDateString('en-US', { month: 'short', timeZone: tz }),
    day: date.toLocaleDateString('en-US', { day: 'numeric', timeZone: tz }),
  }
}
