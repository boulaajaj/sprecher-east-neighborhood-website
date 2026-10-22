import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { parseClientIp, SlidingWindowCounter } from '@/platform/lib'
import { hasAdminOrEditor } from '@/platform/payload/roles'

import { RATE_LIMITS } from '../domain/rateLimits'

// In memory: the site runs as one PM2 process.
const submissions = new SlidingWindowCounter(RATE_LIMITS.windowMs, RATE_LIMITS.trackedConnections)
const formEmails = new SlidingWindowCounter(RATE_LIMITS.windowMs)
const SITE_WIDE = 'site'
let capLoggedAt = 0

/**
 * A hook that gives anonymous visitors a few submissions per hour per connection (client IP),
 * then answers 429. Admins and editors are never limited; without a known IP it doesn't apply.
 */
export const rateLimitSubmissions: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create') return data
  if (hasAdminOrEditor(req.user)) return data

  const ip = parseClientIp(req.headers)
  if (!ip) return data

  if (!submissions.tryTake(ip, RATE_LIMITS.submissionsPerConnection, Date.now())) {
    throw new APIError(
      'Too many messages from your connection. Please try again later.',
      429,
      null,
      true,
    )
  }

  return data
}

/** Applies the site-wide hourly email cap to the emails a submission is about to send. */
export const capFormEmails = <T>(emails: T[], logger: { warn: (msg: string) => void }): T[] => {
  const now = Date.now()
  const room = formEmails.room(SITE_WIDE, RATE_LIMITS.emailsSiteWide, now)
  if (emails.length > room) {
    // One log line per window, not one per request
    if (now - capLoggedAt >= RATE_LIMITS.windowMs) {
      logger.warn('Form emails hit the site-wide hourly limit; submissions are still stored')
      capLoggedAt = now
    }
  }
  const allowed = emails.slice(0, room)
  formEmails.record(SITE_WIDE, now, allowed.length)
  return allowed
}
