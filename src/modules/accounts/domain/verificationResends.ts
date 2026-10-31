/**
 * How often a new account's verification email may be sent again (#289): a repeated sign-up for
 * an address whose account isn't verified yet resends the link, at most `perWindow` times, then
 * nothing until `windowMs` has passed since the first resend. A verified account never resends.
 * The count is stored on the account, so it survives restarts.
 */
export const VERIFICATION_RESENDS = {
  perWindow: 3,
  windowMs: 3 * 60 * 60 * 1000,
} as const

/** What the account holds about its resends: how many, and since when (both empty at first). */
export type ResendCount = { resends: number; since: Date | null }

/**
 * Whether one more resend is allowed now, and the count to store if it is. A window that ended
 * starts over from this resend.
 */
export function takeResend(
  current: ResendCount,
  now: Date,
): { allowed: true; next: ResendCount } | { allowed: false } {
  const windowOpen =
    current.since !== null &&
    now.getTime() - current.since.getTime() < VERIFICATION_RESENDS.windowMs
  if (!windowOpen) return { allowed: true, next: { resends: 1, since: now } }
  if (current.resends >= VERIFICATION_RESENDS.perWindow) return { allowed: false }
  return { allowed: true, next: { resends: current.resends + 1, since: current.since } }
}
