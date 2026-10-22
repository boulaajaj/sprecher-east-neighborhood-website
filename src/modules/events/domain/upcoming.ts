/** The two event listings: events still to come, and events already held. */
export const EVENT_SCOPES = ['upcoming', 'past'] as const

export type EventScope = (typeof EVENT_SCOPES)[number]

/** Checks a scope coming from a URL or a client request. */
export function isEventScope(value: unknown): value is EventScope {
  return EVENT_SCOPES.some((scope) => scope === value)
}

/**
 * True when an event on `date` is upcoming on `today`: the same day or later. Both are day-only
 * dates stored as midnight UTC; `today` is the date in the site timezone (`startOfToday()`), so
 * an event stays upcoming until midnight in Madison, not midnight UTC.
 */
export function isUpcoming(date: string, today: string): boolean {
  return Date.parse(date) >= Date.parse(today)
}
