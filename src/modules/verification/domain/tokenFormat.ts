// Pure, so the confirm page and the browser can check a link too. Tokens are made in cms/token.ts
// (node:crypto stays out of the domain).
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

/** A token from a link, or `null` when it can't be one of ours (wrong type, length or characters). */
export function parseConfirmationToken(value: unknown): string | null {
  return typeof value === 'string' && TOKEN_PATTERN.test(value) ? value : null
}
