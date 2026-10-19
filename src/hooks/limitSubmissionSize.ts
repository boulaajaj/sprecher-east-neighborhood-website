import { APIError, type CollectionBeforeValidateHook } from 'payload'

/** Generous for a contact form (a long message is ~1,500 words), small enough to stop junk. */
export const SUBMISSION_LIMITS = {
  maxFields: 50,
  maxFieldNameLength: 100,
  maxValueLength: 10_000,
  maxTotalLength: 20_000,
} as const

type SubmissionRow = { field?: unknown; value?: unknown }

/**
 * Rejects oversized public form submissions before anything else runs (no Turnstile call, no
 * database write). Payload's own field validation only checks that values exist.
 */
export const limitSubmissionSize: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation !== 'create' || !data) return data

  const rows: unknown = data.submissionData
  if (rows === undefined || rows === null) return data

  const tooLarge = () =>
    new APIError(
      'Your message is too long to send. Please shorten it and try again.',
      413,
      null,
      true,
    )

  if (!Array.isArray(rows) || rows.length > SUBMISSION_LIMITS.maxFields) throw tooLarge()

  let total = 0
  for (const row of rows as SubmissionRow[]) {
    const field = typeof row?.field === 'string' ? row.field : ''
    const value = typeof row?.value === 'string' ? row.value : String(row?.value ?? '')
    if (field.length > SUBMISSION_LIMITS.maxFieldNameLength) throw tooLarge()
    if (value.length > SUBMISSION_LIMITS.maxValueLength) throw tooLarge()
    total += field.length + value.length
    if (total > SUBMISSION_LIMITS.maxTotalLength) throw tooLarge()
  }
  return data
}
