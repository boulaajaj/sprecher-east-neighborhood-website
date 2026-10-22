import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { hasAdminOrEditor } from '@/platform/payload/roles'

import { RATE_LIMITS } from '../domain/rateLimits'
import { parseClientIp } from './clientIp'

// In memory: the site runs as one PM2 process.
const recentByIp = new Map<string, number[]>()
let emailsSent: number[] = []
let capLoggedAt = 0

const withinWindow = (times: number[], now: number) =>
  times.filter((t) => now - t < RATE_LIMITS.windowMs)

/**
 * A hook that gives anonymous visitors a few submissions per hour per connection (client IP),
 * then answers 429. Admins and editors are never limited; without a known IP it doesn't apply.
 */
export const rateLimitSubmissions: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create') return data
  if (hasAdminOrEditor(req.user)) return data

  const ip = parseClientIp(req.headers)
  if (!ip) return data

  const now = Date.now()
  const recent = withinWindow(recentByIp.get(ip) ?? [], now)
  if (recent.length >= RATE_LIMITS.submissionsPerConnection) {
    throw new APIError(
      'Too many messages from your connection. Please try again later.',
      429,
      null,
      true,
    )
  }
  recent.push(now)
  recentByIp.delete(ip) // re-insert so this IP becomes the newest entry
  recentByIp.set(ip, recent)
  if (recentByIp.size > RATE_LIMITS.trackedConnections) {
    const oldest = recentByIp.keys().next().value
    if (oldest !== undefined) recentByIp.delete(oldest)
  }

  return data
}

/** Applies the site-wide hourly email cap to the emails a submission is about to send. */
export const capFormEmails = <T>(emails: T[], logger: { warn: (msg: string) => void }): T[] => {
  const now = Date.now()
  emailsSent = withinWindow(emailsSent, now)
  const room = Math.max(0, RATE_LIMITS.emailsSiteWide - emailsSent.length)
  if (emails.length > room) {
    // One log line per window, not one per request
    if (now - capLoggedAt >= RATE_LIMITS.windowMs) {
      logger.warn('Form emails hit the site-wide hourly limit; submissions are still stored')
      capLoggedAt = now
    }
  }
  const allowed = emails.slice(0, room)
  for (let i = 0; i < allowed.length; i++) emailsSent.push(now)
  return allowed
}
