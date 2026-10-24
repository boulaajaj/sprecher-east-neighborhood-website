import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Field } from 'payload'

import type { EmailConfirmedListener, EmailConfirmer } from '@/platform/payload/emailConfirmer'
import { isAdminFieldAccess } from '@/platform/payload/roles'

import { FORM_SUBMISSIONS, findSenderEmail, type SubmittedRow } from '../domain/senderEmail'
import { holdEmails, releaseHeldEmails, takeHeldEmails } from './heldEmails'

/**
 * Set by the server only, from the submission and the email confirmation (#183). Only admins
 * read them: the answer to a visitor's own submission would otherwise say whether the address
 * they typed is confirmed.
 */
export const senderEmailFields: Field[] = [
  {
    // Text, not `email`: Payload's email check is stricter than the form's (it refuses
    // "josé@example.com" or "ana@example.c"), and a refused field would refuse the whole message,
    // which must always reach the owner (#183). `findSenderEmail` already keeps it to one address.
    name: 'senderEmail',
    type: 'text',
    index: true,
    access: { read: isAdminFieldAccess },
    admin: { readOnly: true, position: 'sidebar', description: 'From the form’s email field.' },
  },
  {
    name: 'emailConfirmed',
    type: 'checkbox',
    defaultValue: false,
    access: { read: isAdminFieldAccess },
    admin: {
      readOnly: true,
      position: 'sidebar',
      description: 'Ticked once the sender clicks the confirmation link we email them.',
    },
  },
  {
    // The message's emails, kept until the sender confirms their address, then sent (#287).
    // Server-only. `hidden` only hides it from reads, so writes are refused too: a visitor's own
    // value would otherwise be sent as written once they confirm. The server writes it through the
    // database adapter, and `recordSenderEmail` clears anything sent with a new submission.
    name: 'heldEmails',
    type: 'json',
    hidden: true,
    access: { create: () => false, update: () => false, read: () => false },
  },
]

/**
 * A hook that records who sent a new submission and whether that address is already confirmed.
 * It always overwrites both fields, and clears the held emails, so a visitor can't send any of
 * them. Runs after the safeguards.
 */
export const recordSenderEmail =
  (confirmer: EmailConfirmer): CollectionBeforeChangeHook =>
  async ({ data, operation, req }) => {
    if (operation !== 'create') return data
    const formId = typeof data.form === 'object' && data.form !== null ? data.form.id : data.form
    const form = formId
      ? await req.payload.findByID({
          collection: 'forms',
          id: formId,
          depth: 0,
          select: { fields: true },
          // A form's fields are public: visitors read them to fill the form in
          overrideAccess: false,
          // An unknown form gives null here, so the field validation that follows answers with
          // its usual 400 ("this form does not exist") instead of a 404 from this lookup
          disableErrors: true,
          req,
        })
      : null
    const senderEmail = findSenderEmail(form?.fields, data.submissionData as SubmittedRow[])
    return {
      ...data,
      senderEmail,
      emailConfirmed: senderEmail ? await confirmer.isConfirmed(senderEmail, req) : false,
      // Only the form's own email step fills this in, after the safety rules (#287)
      heldEmails: null,
    }
  }

/**
 * A hook that asks the sender of a new submission to confirm their address, unless it already
 * is. Runs after the form builder's email step, which left the message's emails in the context
 * instead of sending them: it stores them on the submission first, for the confirmation to send
 * (#287). Never throws, so the submission is kept.
 * Reads `data` (what `recordSenderEmail` set), not `doc`: a visitor's `doc` has been read with
 * their access, which hides both fields.
 */
export const requestSenderConfirmation =
  (confirmer: EmailConfirmer): CollectionAfterChangeHook =>
  async ({ data, doc, operation, req }) => {
    if (operation === 'create' && typeof data.senderEmail === 'string' && !data.emailConfirmed) {
      const held = takeHeldEmails(req.context)
      if (held.length > 0) {
        await holdEmails(doc.id, held, req).catch((error: unknown) =>
          req.payload.logger.error(
            `Form emails of submission ${doc.id} could not be held for confirmation (${error instanceof Error ? error.name : 'error'})`,
          ),
        )
      }
      await confirmer.request(data.senderEmail, req)
    }
    return doc
  }

/**
 * When an address is confirmed, sends the emails its messages were holding (#287), then marks
 * those messages as confirmed.
 */
export const markSubmissionsConfirmed: EmailConfirmedListener = async (email, req) => {
  await releaseHeldEmails(email, req)
  await req.payload.update({
    collection: FORM_SUBMISSIONS,
    where: { and: [{ senderEmail: { equals: email } }, { emailConfirmed: { not_equals: true } }] },
    data: { emailConfirmed: true },
    depth: 0,
    // Submissions are admin-only; the person confirming isn't signed in
    overrideAccess: true,
    req,
  })
}
