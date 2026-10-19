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
 * Rejects oversized or malformed public form submissions before anything else runs (no Turnstile
 * call, no database write). Payload's own field validation only checks that values exist, so a
 * value that isn't text, a number or a true/false (an object, null) would otherwise fail at the
 * database insert with a 500 and could leave an empty submission behind. Applies to every form
 * built in the CMS; the limits are generous for normal use.
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
  const malformed = () =>
    new APIError(
      'This form couldn’t be read. Please reload the page and try again.',
      400,
      null,
      true,
    )

  if (!Array.isArray(rows)) throw malformed()
  if (rows.length > SUBMISSION_LIMITS.maxFields) throw tooLarge()

  let total = 0
  for (const row of rows as unknown[]) {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) throw malformed()
    const { field, value: raw } = row as SubmissionRow
    if (typeof field !== 'string') throw malformed()
    if (typeof raw !== 'string' && typeof raw !== 'number' && typeof raw !== 'boolean') {
      throw malformed()
    }
    const value = String(raw)
    if (field.length > SUBMISSION_LIMITS.maxFieldNameLength) throw tooLarge()
    if (value.length > SUBMISSION_LIMITS.maxValueLength) throw tooLarge()
    total += field.length + value.length
    if (total > SUBMISSION_LIMITS.maxTotalLength) throw tooLarge()
  }
  return data
}
