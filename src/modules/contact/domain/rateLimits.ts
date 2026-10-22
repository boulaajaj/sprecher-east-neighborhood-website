/**
 * How many public form submissions and emails the site accepts (decision 0004). Protects the
 * inbox and the Mailgun quota from floods. Admins and editors are never limited.
 */
export const RATE_LIMITS = {
  /** The sliding window every limit counts in. */
  windowMs: 60 * 60 * 1000,
  /** Submissions per window from one connection (client IP). */
  submissionsPerConnection: 5,
  /**
   * Form emails sent per window, site-wide. Counted on emails actually going out, not on
   * submission attempts, so junk or failed submissions can't use it up and lock residents out.
   * Bounds Mailgun volume even if X-Forwarded-For is spoofed (#118). Above it, emails are
   * dropped but the submission is still stored in Admin → Form Submissions.
   */
  emailsSiteWide: 30,
  /** Bounded memory: past this many connections, the oldest tracked one is forgotten. */
  trackedConnections: 2000,
} as const
