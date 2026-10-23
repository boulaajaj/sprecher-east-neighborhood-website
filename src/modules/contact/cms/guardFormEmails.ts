import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'

import type { FormSubmission } from '@/payload-types'

import { toSafeFormEmail } from '../domain/formEmails'
import { toSenderEmailNote } from '../domain/senderEmail'
import { capFormEmails } from './rateLimits'

/**
 * The form builder's `beforeEmail`: applies the form-email rules (`domain/formEmails.ts`) to each
 * email a submission is about to send, then the site-wide hourly cap. The plugin formats the
 * emails in the order of the form's own email settings, so each is matched to its setting by
 * position. The submission is stored either way.
 */
export const guardFormEmails: BeforeEmail<FormSubmission> = async (emails, { data, req }) => {
  const form = data?.form
  const id = typeof form === 'object' && form !== null ? form.id : form
  if (id === undefined || id === null) return []

  const { emails: settings } = await req.payload.findByID({
    collection: 'forms',
    id,
    depth: 0,
    // The email settings are staff-only; the server reads them for any submission
    overrideAccess: true,
    req,
  })

  const allowed = emails.flatMap((email, index) => {
    const decision = toSafeFormEmail(email, settings?.[index])
    if (!decision.send) {
      req.payload.logger.warn('Form email addressed from submitted data was not sent')
      return []
    }
    if (decision.fromReplaced) {
      req.payload.logger.warn('Form email From used submitted data; sent from the default address')
    }
    if (decision.replyToReplaced) {
      req.payload.logger.warn(
        'Form email Reply-To from submitted data was not one address; replies go to the sender address',
      )
    }
    return [decision.email]
  })

  // Every email that goes out says whether the sender confirmed their address (#183)
  const note = toSenderEmailNote(data?.senderEmail, data?.emailConfirmed)
  const marked = note
    ? allowed.map((email) => ({ ...email, html: `${email.html}<p>${note}</p>` }))
    : allowed

  return capFormEmails(marked, req.payload.logger)
}
