/**
 * Checks for the paging parameters in listing URLs and "Load more" requests. Kept free of
 * Payload and Next imports so the proxy (`src/proxy.ts`, #119), pages and server actions share one rule.
 */

/** Highest page a client may request — a sanity bound, far above real content. */
export const MAX_PAGE = 500

export type EventScope = 'upcoming' | 'past'

/** Validates a page number coming from a URL or a client request. */
export function parsePageNumber(value: unknown): number | null {
  // Only plain decimal digits without leading zeros, or an integer: rejects "0x10", "2e2",
  // "02" (a duplicate of page 2), true, [2], etc.
  const page =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^[1-9]\d{0,3}$/.test(value)
        ? Number(value)
        : NaN
  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : null
}

export function isEventScope(value: unknown): value is EventScope {
  return value === 'upcoming' || value === 'past'
}
