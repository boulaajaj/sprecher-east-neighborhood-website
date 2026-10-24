import { parseEmailAddress } from '@/platform/lib'

/** The form builder's submissions collection. */
export const FORM_SUBMISSIONS = 'form-submissions'

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

/** What happens to a message's emails when it's submitted (#287). */
export type EmailDelivery = 'send' | 'hold' | 'drop'

/**
 * What happens to a message's emails when it's submitted (#287). The owner decided on #274 that a
 * contact message reaches him only after its sender confirms their address:
 * - `send`: the address is already confirmed, or the form asks for no email (nobody to confirm);
 * - `hold`: kept until the address is confirmed;
 * - `drop`: the form asks for an email but the message has no valid one. A request built by hand
 *   can leave it out; sending at once would skip the confirmation. The message is still stored.
 */
export function toEmailDelivery({
  senderEmail,
  confirmed,
  fields,
}: {
  senderEmail: unknown
  confirmed: unknown
  fields: readonly FormFieldShape[] | null | undefined
}): EmailDelivery {
  if (typeof senderEmail === 'string' && senderEmail !== '') {
    return confirmed === true ? 'send' : 'hold'
  }
  return (fields ?? []).some((field) => field.blockType === 'email') ? 'drop' : 'send'
}

/** The line added to a message's emails when they go out: `null` when it has no sender address. */
export function toSenderEmailNote(senderEmail: unknown): string | null {
  return typeof senderEmail === 'string' && senderEmail ? SENDER_CONFIRMED_NOTE : null
}
