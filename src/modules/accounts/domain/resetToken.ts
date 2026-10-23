// Payload makes the reset token (40 hex characters in 3.91) and checks it. This only refuses
// what can't be a token at all, so the page never hands a list or a huge string to the form; the
// bounds are loose, so a change in Payload's token format doesn't break the page.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

/** A reset token from a link, or `null` when it can't be one (wrong type, length or characters). */
export function parseResetToken(value: unknown): string | null {
  return typeof value === 'string' && TOKEN_PATTERN.test(value) ? value : null
}
