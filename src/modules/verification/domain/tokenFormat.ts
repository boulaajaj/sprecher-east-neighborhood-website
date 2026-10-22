// Apart from token.ts, which needs node:crypto: the confirm page and the browser parse links too.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

/** A token from a link, or `null` when it can't be one of ours (wrong type, length or characters). */
export function parseConfirmationToken(value: unknown): string | null {
  return typeof value === 'string' && TOKEN_PATTERN.test(value) ? value : null
}
