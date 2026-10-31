import type { FormattedEmail } from '@payloadcms/plugin-form-builder/types'
import type { PayloadRequest } from 'payload'

import { FORM_SUBMISSIONS, toSenderEmailNote } from '../domain/senderEmail'
import { capFormEmails } from './rateLimits'

/**
 * Where the form builder's email step leaves a new message's held emails in the request's
 * context (`req.context`), for the hook that runs after it, which knows the submission's id, to
 * store them (#287).
 */
export const HELD_EMAILS = 'heldFormEmails'

/**
 * Takes the held emails the email step left in the context (anything else is none), and removes
 * them, so another submission in the same request can't pick them up.
 */
export function takeHeldEmails(context: Record<string, unknown>): FormattedEmail[] {
  const held = toHeldEmails(context[HELD_EMAILS])
  context[HELD_EMAILS] = undefined
  return held
}

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
    // One message that fails doesn't keep the others from going out
    await releaseOne(doc.id, toHeldEmails(doc.heldEmails), email, req).catch((error: unknown) =>
      req.payload.logger.error(
        `Held emails of form submission ${doc.id} could not be released (${error instanceof Error ? error.name : 'error'})`,
      ),
    )
  }
}

/** Clears one message's held emails, then sends them, marked confirmed, within the cap. */
async function releaseOne(
  id: number | string,
  held: FormattedEmail[],
  senderEmail: string,
  req: PayloadRequest,
): Promise<void> {
  if (held.length === 0) return
  await req.payload.db.updateOne({
    collection: FORM_SUBMISSIONS,
    id,
    data: { heldEmails: null },
    req,
    returning: false,
  })
  for (const message of capFormEmails(withSenderNote(held, senderEmail), req.payload.logger)) {
    try {
      await req.payload.sendEmail(message)
    } catch (error) {
      req.payload.logger.error(
        `Held email of form submission ${id} could not be sent (${error instanceof Error ? error.name : 'error'})`,
      )
    }
  }
}

/** The held emails stored on a submission; anything else is none. */
function toHeldEmails(value: unknown): FormattedEmail[] {
  return Array.isArray(value) ? (value as FormattedEmail[]) : []
}
