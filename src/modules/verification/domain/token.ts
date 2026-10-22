import { createHash, randomBytes } from 'node:crypto'

/** 32 random bytes in base64url: 43 characters (`tokenFormat.ts`), 256 bits nobody can guess. */
const TOKEN_BYTES = 32

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
