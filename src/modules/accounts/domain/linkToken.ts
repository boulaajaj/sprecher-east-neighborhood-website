// Payload makes the tokens in its reset and verify links (40 hex characters in 3.91) and checks
// them. This only refuses what can't be a token at all, so a page never hands a list or a huge
// string to its form; the bounds are loose, so a change in Payload's token format doesn't break
// the pages.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

/** A token from a link, or `null` when it can't be one (wrong type, length or characters). */
export function parseLinkToken(value: unknown): string | null {
  return typeof value === 'string' && TOKEN_PATTERN.test(value) ? value : null
}

/**
 * A link to one of the site's own pages with Payload's token in the query string, for the emails
 * Payload sends. Built from the configured site address, never from the request's Host header.
 */
export function toLinkWithToken(siteUrl: string, path: string, token: string): string {
  const url = new URL(path, siteUrl)
  url.searchParams.set('token', token)
  return url.toString()
}
