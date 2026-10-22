// Spaces around a query don't change the results, and a query of only spaces is no query.

/** The search query from the address (`?q=`): the first one if repeated, trimmed; '' for none. */
export function parseSearchQuery(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

/** The search page's address for `query`, encoded, or the plain page when there is no query. */
export function toSearchHref(query: string): string {
  const trimmed = query.trim()
  return `/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`
}
