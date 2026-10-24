import { toConfirmedCutoff, toUnconfirmedCutoff } from '@/platform/lib'

/** A stored message as the retention rules read it. `form` is its form's id. */
export type SubmissionAge = {
  id: number
  createdAt: string
  form?: number | null
  senderEmail?: string | null
  emailConfirmed?: boolean | null
  retentionHold?: boolean | null
}

/** What the rules need to know besides the messages. */
export type RetentionContext = {
  /** The forms that ask for an email: a message from one of them needs its sender's click. */
  formsAskingForEmail: ReadonlySet<number>
  /** The addresses that sent a message in the last 12 months. */
  recentSenders: ReadonlySet<string>
}

/**
 * Whether a message is unconfirmed under the owner's rule ("Delete unconfirmed submissions after
 * a short expiration period, such as 48 hours", #274): it isn't confirmed, and it has a sender
 * address or its form asks for one. That covers messages held for a click (#287), messages whose
 * form asked for an email but that carry no valid one (`drop`), and messages stored before #183
 * recorded the address. A message from a form with no email field has nobody to confirm.
 */
const isUnconfirmed = (submission: SubmissionAge, forms: ReadonlySet<number>): boolean =>
  submission.emailConfirmed !== true &&
  (Boolean(submission.senderEmail) ||
    (typeof submission.form === 'number' && forms.has(submission.form)))

const isBefore = (date: string, cutoff: string): boolean => Date.parse(date) < Date.parse(cutoff)

/**
 * The messages the owner's retention rules delete now (#274), out of `submissions`:
 * - a message on hold (`retentionHold`, set by staff for an active matter or a retention
 *   requirement) is always kept;
 * - an unconfirmed message (above) goes 48 hours after it was sent, which is when its
 *   confirmation link went out;
 * - any other message goes 12 months after its sender's last message. A message without an
 *   address (its form asks for none) goes 12 months after it was sent: an agent's reading, since
 *   the owner's words don't cover a sender nobody can identify.
 */
export function toExpiredSubmissionIds(
  submissions: readonly SubmissionAge[],
  { formsAskingForEmail, recentSenders }: RetentionContext,
  now: number,
): number[] {
  const unconfirmedCutoff = toUnconfirmedCutoff(now)
  const confirmedCutoff = toConfirmedCutoff(now)
  return submissions
    .filter((submission) => {
      if (submission.retentionHold === true) return false
      if (isUnconfirmed(submission, formsAskingForEmail)) {
        return isBefore(submission.createdAt, unconfirmedCutoff)
      }
      if (!isBefore(submission.createdAt, confirmedCutoff)) return false
      return !(submission.senderEmail && recentSenders.has(submission.senderEmail))
    })
    .map(({ id }) => id)
}

/**
 * Whether the rules above need to know the recent senders for these messages: only an old enough
 * message from a confirmed sender depends on them.
 */
export const needsRecentSenders = (submissions: readonly SubmissionAge[], now: number): boolean =>
  submissions.some(
    (submission) =>
      Boolean(submission.senderEmail) &&
      submission.emailConfirmed === true &&
      isBefore(submission.createdAt, toConfirmedCutoff(now)),
  )
