import { APIError, type CollectionBeforeChangeHook } from 'payload'
import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'

import type { User } from '@/payload-types'
import { ROLES } from '@/access/roles'
import { clientIpFromHeaders } from '@/utilities/clientIp'

/**
 * Guards for public form submissions now that the site can send real email.
 *
 * 1. Rate limit: anonymous visitors get a few submissions per hour per IP. Protects the
 *    inbox and the Mailgun quota from floods. In-memory: the site runs as one PM2 process.
 * 2. No mail to addresses the visitor typed in: a form email whose recipients come from the
 *    submission (e.g. a confirmation to "{{email}}") would let anyone make the site send mail
 *    to arbitrary addresses, including comma-separated lists. Those emails are dropped; emails
 *    to recipients the admin configured (e.g. info@) still go out. Re-enabling visitor
 *    confirmations is an owner decision (needs spam protection, see #112).
 */

const WINDOW_MS = 60 * 60 * 1000
const MAX_SUBMISSIONS_PER_WINDOW = 5
const recentByIp = new Map<string, number[]>()

export const rateLimitSubmissions: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const role = (req.user as User | null)?.role
  if (role === ROLES.admin || role === ROLES.editor) return data

  const ip = clientIpFromHeaders(req.headers)
  if (!ip) return data

  const now = Date.now()
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    throw new APIError(
      'Too many messages from your connection. Please try again later.',
      429,
      null,
      true,
    )
  }
  recent.push(now)
  recentByIp.set(ip, recent)

  // Keep the map small: drop IPs with no submissions in the window
  if (recentByIp.size > 1000) {
    for (const [key, times] of recentByIp) {
      if (times.every((t) => now - t >= WINDOW_MS)) recentByIp.delete(key)
    }
  }

  return data
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

  return emails.filter((_email, index) => {
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
}
