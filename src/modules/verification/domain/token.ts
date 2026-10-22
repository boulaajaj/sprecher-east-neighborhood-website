import { createHash, randomBytes } from 'node:crypto'

/** 32 random bytes in base64url: 43 characters, 256 bits nobody can guess. */
const TOKEN_BYTES = 32
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

/** A new confirmation token, for the link, and its hash, the only part the database keeps. */
export function newConfirmationToken(): { token: string; tokenHash: string } {
  const token = randomBytes(TOKEN_BYTES).toString('base64url')
  return { token, tokenHash: hashConfirmationToken(token) }
}

/**
 * The SHA-256 of a token, in hex. A database copy or backup holds no working link. A plain hash
 * is enough (no salt or slow hash): the token is random, not a password someone chose.
 */
export function hashConfirmationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** A token from a link, or `null` when it can't be one of ours (wrong type, length or characters). */
export function parseConfirmationToken(value: unknown): string | null {
  return typeof value === 'string' && TOKEN_PATTERN.test(value) ? value : null
}
