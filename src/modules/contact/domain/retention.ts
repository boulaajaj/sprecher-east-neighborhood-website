import { toConfirmedCutoff, toUnconfirmedCutoff } from '@/platform/lib'

/** A stored message as the retention rules read it. */
export type SubmissionAge = {
  id: number
  createdAt: string
  senderEmail?: string | null
  emailConfirmed?: boolean | null
  retentionHold?: boolean | null
}

/**
 * Whether a message is still held for its sender's confirmation (#287): it has a sender address
 * that isn't confirmed. A message from a form with no email field has nobody to confirm.
 */
const isHeld = (submission: SubmissionAge): boolean =>
  Boolean(submission.senderEmail) && submission.emailConfirmed !== true

const isBefore = (date: string, cutoff: string): boolean => Date.parse(date) < Date.parse(cutoff)

/**
 * The messages the owner's retention rules delete now (#274), out of `submissions`:
 * - a message on hold (`retentionHold`, set by staff for an active matter or a retention
 *   requirement) is always kept;
 * - a message still waiting for its sender to confirm goes 48 hours after it was sent, which is
 *   when its confirmation link went out;
 * - any other message goes 12 months after its sender's last message. `recentSenders` holds the
 *   addresses that sent one in the last 12 months. A message without an address goes 12 months
 *   after it was sent.
 */
export function toExpiredSubmissionIds(
  submissions: readonly SubmissionAge[],
  recentSenders: ReadonlySet<string>,
  now: number,
): number[] {
  const unconfirmedCutoff = toUnconfirmedCutoff(now)
  const confirmedCutoff = toConfirmedCutoff(now)
  return submissions
    .filter((submission) => {
      if (submission.retentionHold === true) return false
      if (isHeld(submission)) return isBefore(submission.createdAt, unconfirmedCutoff)
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
      !isHeld(submission) &&
      isBefore(submission.createdAt, toConfirmedCutoff(now)),
  )
