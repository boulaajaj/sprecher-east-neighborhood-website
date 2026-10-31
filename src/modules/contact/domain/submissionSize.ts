/** Generous for a contact form (a long message is ~1,500 words), small enough to stop junk. */
export const SUBMISSION_LIMITS = {
  maxFields: 50,
  maxFieldNameLength: 100,
  maxValueLength: 10_000,
  maxTotalLength: 20_000,
} as const

/** What `checkSubmissionSize` finds: fine, over a limit, or not something a form sends. */
export type SubmissionSizeCheck = 'ok' | 'too-large' | 'malformed'

type SubmissionRow = { field?: unknown; value?: unknown }

/**
 * Checks a submission's rows (`submissionData`, untrusted) against the limits. Each row must be
 * an object with a text `field` and a text, number or true/false `value`: Payload's own field
 * validation only checks that values exist, so anything else (an object, null) would fail at
 * the database insert with a 500. No rows at all is `ok`; Payload's validation handles that.
 */
export function checkSubmissionSize(rows: unknown): SubmissionSizeCheck {
  if (rows === undefined || rows === null) return 'ok'
  if (!Array.isArray(rows)) return 'malformed'
  if (rows.length > SUBMISSION_LIMITS.maxFields) return 'too-large'

  let total = 0
  for (const row of rows as unknown[]) {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) return 'malformed'
    const { field, value: raw } = row as SubmissionRow
    if (typeof field !== 'string') return 'malformed'
    if (typeof raw !== 'string' && typeof raw !== 'number' && typeof raw !== 'boolean') {
      return 'malformed'
    }
    const value = String(raw)
    if (field.length > SUBMISSION_LIMITS.maxFieldNameLength) return 'too-large'
    if (value.length > SUBMISSION_LIMITS.maxValueLength) return 'too-large'
    total += field.length + value.length
    if (total > SUBMISSION_LIMITS.maxTotalLength) return 'too-large'
  }
  return 'ok'
}
