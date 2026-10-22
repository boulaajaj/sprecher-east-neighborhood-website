/**
 * Paging for the listings that load more as you scroll (/posts, /events). Kept free of Payload
 * and Next imports so the proxy (`src/proxy.ts`, #119), pages and server actions share one rule.
 */

/** Highest page a client may request — a sanity bound, far above real content. */
export const MAX_PAGE = 500

/** One page of a listing: what a page renders first and what "Load more" fetches next. */
export type FeedPage<T> = {
  docs: T[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
}

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
