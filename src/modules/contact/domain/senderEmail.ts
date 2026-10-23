import { parseEmailAddress } from '@/platform/lib'

/** A form field as this rule reads it: its block type (`email`, `text`…) and its name. */
export type FormFieldShape = { blockType?: string; name?: string | null }

/** One row of a submission: the field's name and what was typed. */
export type SubmittedRow = { field?: string | null; value?: unknown }

/**
 * The sender's address in a submission: the value of the form's first email field that holds one
 * plain address, trimmed and lowercase. `null` when the form has no email field or it holds
 * anything else.
 */
export function findSenderEmail(
  fields: readonly FormFieldShape[] | null | undefined,
  rows: readonly SubmittedRow[] | null | undefined,
): string | null {
  const emailFields = new Set(
    (fields ?? []).filter((f) => f.blockType === 'email' && f.name).map((f) => f.name),
  )
  for (const row of rows ?? []) {
    if (!row.field || !emailFields.has(row.field)) continue
    const email = parseEmailAddress(row.value)
    if (email) return email
  }
  return null
}

/** The fixed line a held message's emails get when they go out (#183, #287). */
export const SENDER_CONFIRMED_NOTE = 'Sender’s email: confirmed.'

/**
 * Whether a message's emails wait for its sender to confirm their address (#287). The owner
 * decided on #274 that a contact message reaches him only after that click. A message from an
 * address already confirmed, or from a form with no email field (nobody to ask), goes out at once.
 */
export function holdsForConfirmation(senderEmail: unknown, confirmed: unknown): boolean {
  return typeof senderEmail === 'string' && senderEmail !== '' && confirmed !== true
}

/** The line added to a message's emails when they go out: `null` when it has no sender address. */
export function toSenderEmailNote(senderEmail: unknown): string | null {
  return typeof senderEmail === 'string' && senderEmail ? SENDER_CONFIRMED_NOTE : null
}
