import type { FormattedEmail } from '@payloadcms/plugin-form-builder/types'
import type { PayloadRequest } from 'payload'

import { toSenderEmailNote } from '../domain/senderEmail'
import { capFormEmails } from './rateLimits'

const FORM_SUBMISSIONS = 'form-submissions'

/**
 * Where the form builder's email step leaves a new message's held emails in the request's
 * context (`req.context`), for the hook that runs after it, which knows the submission's id, to
 * store them (#287).
 */
export const HELD_EMAILS = 'heldFormEmails'

/** The held emails the email step left in the context; anything else is none. */
export const takeHeldEmails = (context: Record<string, unknown>): FormattedEmail[] =>
  toHeldEmails(context[HELD_EMAILS])

/** Adds the line saying the sender confirmed their address (#183) to each email. */
export const withSenderNote = (
  emails: FormattedEmail[],
  senderEmail: unknown,
): FormattedEmail[] => {
  const note = toSenderEmailNote(senderEmail)
  return note ? emails.map((email) => ({ ...email, html: `${email.html}<p>${note}</p>` })) : emails
}

/**
 * Stores a message's emails, as the form builder made them and after the safety rules, on the
 * submission instead of sending them, until its sender confirms their address (#287). Writes
 * with `db.updateOne`: the submission was just created, and this server-only field needs no
 * hooks or access check.
 */
export async function holdEmails(
  submissionId: number | string,
  emails: FormattedEmail[],
  req: PayloadRequest,
): Promise<void> {
  await req.payload.db.updateOne({
    collection: FORM_SUBMISSIONS,
    id: submissionId,
    data: { heldEmails: emails },
    req,
    returning: false,
  })
}

/**
 * Sends the emails held for this address's messages (#287), each marked confirmed, within the
 * site-wide email cap. Each message's emails are cleared before they're sent, so nothing goes
 * out twice; a send that fails is logged, and the message stays in the admin either way.
 */
export async function releaseHeldEmails(email: string, req: PayloadRequest): Promise<void> {
  const { docs } = await req.payload.find({
    collection: FORM_SUBMISSIONS,
    where: {
      and: [{ senderEmail: { equals: email } }, { emailConfirmed: { not_equals: true } }],
    },
    depth: 0,
    pagination: false,
    // Submissions are admin-only, and the held emails are a server-only field
    overrideAccess: true,
    showHiddenFields: true,
    req,
  })
  for (const doc of docs) {
    const held = toHeldEmails(doc.heldEmails)
    if (held.length === 0) continue
    await req.payload.db.updateOne({
      collection: FORM_SUBMISSIONS,
      id: doc.id,
      data: { heldEmails: null },
      req,
      returning: false,
    })
    for (const message of capFormEmails(withSenderNote(held, email), req.payload.logger)) {
      try {
        await req.payload.sendEmail(message)
      } catch (error) {
        req.payload.logger.error(
          `Held form email could not be sent (${error instanceof Error ? error.name : 'error'})`,
        )
      }
    }
  }
}

/** The held emails stored on a submission; anything else is none. */
function toHeldEmails(value: unknown): FormattedEmail[] {
  return Array.isArray(value) ? (value as FormattedEmail[]) : []
}
