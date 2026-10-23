/**
 * How many sign-ups the site accepts (#187, decision 0007), the same shape as the contact form's
 * limits (decision 0004). Each sign-up hashes a password on the one-CPU server and sends Payload's
 * verification email, so both are bounded: per connection, and site-wide for the Mailgun quota.
 */
export const SIGN_UP_LIMITS = {
  /** The sliding window every limit counts in. */
  windowMs: 60 * 60 * 1000,
  /** Sign-up attempts per window from one connection (client IP), counted before the robot check. */
  attemptsPerConnection: 5,
  /**
   * Accounts created per window, site-wide. Counted only on sign-ups that reach Payload, so junk
   * or blocked attempts can't use it up. Bounds verification emails even if X-Forwarded-For is
   * spoofed (#118).
   */
  accountsSiteWide: 20,
  /** Bounded memory: past this many connections, the oldest tracked one is forgotten. */
  trackedConnections: 2000,
} as const
