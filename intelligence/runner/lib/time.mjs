// Dates in the site's timezone (scout.md step 1 and 5): every local time gets America/Chicago's
// offset for that date, and "today" is the date in Chicago, not on the machine running this.

export const SITE_TIMEZONE = 'America/Chicago'

const pad = (n) => String(n).padStart(2, '0')

/** The zone's offset at an instant, as `-05:00`. */
export function offsetAt(instant, timeZone = SITE_TIMEZONE) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(instant)
    .find((p) => p.type === 'timeZoneName')?.value
  const match = /GMT([+-]\d{2}):?(\d{2})?/.exec(part ?? '')
  return match ? `${match[1]}:${match[2] ?? '00'}` : '+00:00'
}

/**
 * A wall-clock time in the zone as an ISO date-time with that day's offset. The offset is taken
 * at the same wall time read as UTC, then corrected once, which is exact outside the hour a
 * clock change skips or repeats.
 */
export function zonedIso({ year, month, day, hour = 0, minute = 0 }, timeZone = SITE_TIMEZONE) {
  const wall = Date.UTC(year, month - 1, day, hour, minute)
  const first = offsetAt(new Date(wall), timeZone)
  const toMs = (offset) => {
    const [h, m] = offset.slice(1).split(':').map(Number)
    return (offset[0] === '-' ? -1 : 1) * (h * 60 + m) * 60_000
  }
  const offset = offsetAt(new Date(wall - toMs(first)), timeZone)
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${offset}`
}

/** The calendar date in the zone, as `YYYY-MM-DD`. */
export function dateIn(instant, timeZone = SITE_TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant)
}

/** `YYYY-MM-DD` plus `days`. */
export function addDays(date, days) {
  const [y, m, d] = date.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + days))
  return next.toISOString().slice(0, 10)
}

/** "7:00 PM" or "19:00" as hours and minutes; null when it isn't a time. */
export function parseClock(text) {
  const match = /^\s*(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?\s*$/.exec(text ?? '')
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2] ?? 0)
  const meridiem = match[3]?.toLowerCase()
  if (meridiem === 'pm' && hour < 12) hour += 12
  if (meridiem === 'am' && hour === 12) hour = 0
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

/** An instant as a UTC ISO date-time with seconds, the format run logs use. */
export const isoNow = (now = new Date()) => now.toISOString().replace(/\.\d{3}Z$/, 'Z')
