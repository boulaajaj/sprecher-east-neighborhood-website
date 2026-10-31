/**
 * How often visitors may use the public account forms that send email: sign-up (#187) and forgot
 * password (#282). The same shape as the contact form's limits (decision 0004). Counted in memory,
 * since the site runs as one PM2 process.
 */
export type RequestLimits = {
  /** The sliding window every limit counts in. */
  readonly windowMs: number
  /** Requests per window from one connection (client IP), counted before the robot check. */
  readonly perConnection: number
  /**
   * Requests per window, site-wide, counted only once they pass the robot check, so blocked
   * attempts can't use it up. It bounds the email sent even if X-Forwarded-For is spoofed (#118).
   */
  readonly siteWide: number
  /** Bounded memory: past this many connections, the oldest tracked one is forgotten. */
  readonly trackedConnections: number
}

const HOUR = 60 * 60 * 1000

/**
 * Sign-up (decision 0007): each one hashes a password on the one-CPU server and sends Payload's
 * verification email.
 */
export const SIGN_UP_LIMITS: RequestLimits = {
  windowMs: HOUR,
  perConnection: 5,
  siteWide: 20,
  trackedConnections: 2000,
}

/**
 * Forgot password (#282): each request can send a reset email. Payload also sends at most one
 * per account every 15 seconds.
 */
export const RESET_REQUEST_LIMITS: RequestLimits = {
  windowMs: HOUR,
  perConnection: 5,
  siteWide: 30,
  trackedConnections: 2000,
}
