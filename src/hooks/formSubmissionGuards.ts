import { APIError, type CollectionBeforeChangeHook } from 'payload'
import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'

import type { User } from '@/payload-types'
import { hasAdminOrEditor } from '@/access/roles'
import { clientIpFromHeaders } from '@/utilities/clientIp'

/**
 * Guards for public form submissions now that the site can send real email.
 *
 * 1. Rate limits: anonymous visitors get a few submissions per hour per IP, and the site sends
 *    at most a fixed number of form emails per hour. Protects the inbox and the Mailgun quota
 *    from floods. In-memory: the site runs as one PM2 process.
 * 2. No mail to addresses the visitor typed in: a form email whose recipients come from the
 *    submission (e.g. a confirmation to "{{email}}") would let anyone make the site send mail
 *    to arbitrary addresses, including comma-separated lists. Those emails are dropped; emails
 *    to recipients the admin configured (e.g. info@) still go out. Re-enabling visitor
 *    confirmations is an owner decision (needs spam protection, see #112).
 */

const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_IP_PER_WINDOW = 5
/**
 * Site-wide ceiling on form emails sent per hour, counted in beforeEmail (emails actually
 * going out), not on submission attempts: junk or failed submissions can't use it up and lock
 * residents out. Bounds Mailgun volume even if X-Forwarded-For is spoofed (#118). Above the
 * cap, emails are dropped but the submission is still stored in Admin → Form Submissions.
 */
const MAX_EMAILS_PER_WINDOW = 30
/** Bounded memory: the oldest tracked IP is evicted first (Map keeps insertion order). */
const MAX_TRACKED_IPS = 2000

const recentByIp = new Map<string, number[]>()
let emailsSent: number[] = []
let capLoggedAt = 0

const withinWindow = (times: number[], now: number) => times.filter((t) => now - t < WINDOW_MS)

export const rateLimitSubmissions: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create') return data
  if (hasAdminOrEditor(req.user as User | null)) return data

  const ip = clientIpFromHeaders(req.headers)
  if (!ip) return data

  const now = Date.now()
  const recent = withinWindow(recentByIp.get(ip) ?? [], now)
  if (recent.length >= MAX_PER_IP_PER_WINDOW) {
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
  if (recentByIp.size > MAX_TRACKED_IPS) {
    const oldest = recentByIp.keys().next().value
    if (oldest !== undefined) recentByIp.delete(oldest)
  }

  return data
}

/** Applies the site-wide hourly email cap to the emails a submission is about to send. */
const capEmails = <T>(emails: T[], logger: { warn: (msg: string) => void }): T[] => {
  const now = Date.now()
  emailsSent = withinWindow(emailsSent, now)
  const room = Math.max(0, MAX_EMAILS_PER_WINDOW - emailsSent.length)
  if (emails.length > room) {
    // One log line per window, not one per request
    if (now - capLoggedAt >= WINDOW_MS) {
      logger.warn('Form emails hit the site-wide hourly limit; submissions are still stored')
      capLoggedAt = now
    }
  }
  const allowed = emails.slice(0, room)
  for (let i = 0; i < allowed.length; i++) emailsSent.push(now)
  return allowed
}

const usesSubmittedValue = (template: string | null | undefined): boolean =>
  typeof template === 'string' && template.includes('{{')

/**
 * Drops form emails whose to/cc/bcc template pulls in a submitted value ("{{email}}").
 * Decided from the form's own email settings, in the same order the plugin formats them,
 * so an admin-configured recipient (e.g. info@) is never dropped because of what a visitor typed.
 */
export const dropEmailsToSubmittedAddresses: BeforeEmail = async (emails, { data, req }) => {
  const formID = (data as { form?: number | string | { id: number | string } } | undefined)?.form
  const id = typeof formID === 'object' && formID !== null ? formID.id : formID
  if (id === undefined || id === null) return []

  const form = await req.payload.findByID({
    collection: 'forms',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const templates = form?.emails ?? []

  const allowed = emails.filter((_email, index) => {
    const template = templates[index]
    const fromSubmission =
      !template ||
      usesSubmittedValue(template.emailTo) ||
      usesSubmittedValue(template.cc) ||
      usesSubmittedValue(template.bcc)
    if (fromSubmission) {
      req.payload.logger.warn('Form email addressed from submitted data was not sent')
    }
    return !fromSubmission
  })

  return capEmails(allowed, req.payload.logger)
}
