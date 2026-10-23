import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'

import type { FormSubmission } from '@/payload-types'

import { toSafeFormEmail } from '../domain/formEmails'
import { holdsForConfirmation } from '../domain/senderEmail'
import { HELD_EMAILS, withSenderNote } from './heldEmails'
import { capFormEmails } from './rateLimits'

/**
 * The form builder's `beforeEmail`: applies the form-email rules (`domain/formEmails.ts`) to each
 * email a submission is about to send, then the site-wide hourly cap. The plugin formats the
 * emails in the order of the form's own email settings, so each is matched to its setting by
 * position. An unconfirmed sender's emails are held instead of sent (#287). The submission is
 * stored either way.
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

  // A message reaches the owner only once its sender confirms their address (#274, #287): until
  // then its emails wait on the submission, and the confirmation sends them
  if (holdsForConfirmation(data?.senderEmail, data?.emailConfirmed)) {
    // The submission's id isn't known here; `requestSenderConfirmation` stores them right after.
    // On the request's context: the hooks' own `context` argument isn't one shared object
    req.context[HELD_EMAILS] = allowed
    return []
  }
  return capFormEmails(withSenderNote(allowed, data?.senderEmail), req.payload.logger)
}
