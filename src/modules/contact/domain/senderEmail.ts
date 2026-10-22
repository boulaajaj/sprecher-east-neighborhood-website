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

/**
 * The fixed line the owner notification gets about the sender's address (#183), or `null` when
 * the submission has none. Contact messages reach the owner right away, marked, until he decides
 * otherwise (open question on #183).
 */
export function toSenderEmailNote(senderEmail: unknown, confirmed: unknown): string | null {
  if (typeof senderEmail !== 'string' || !senderEmail) return null
  return confirmed === true
    ? 'Sender’s email: confirmed.'
    : 'Sender’s email: not confirmed yet (we ask them by email to confirm).'
}
