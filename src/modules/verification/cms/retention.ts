import type { PayloadRequest, TaskConfig } from 'payload'

import { toConfirmedCutoff, toUnconfirmedCutoff } from '@/platform/lib'
import type { ConfirmedEmailKeeper } from '@/platform/payload/emailConfirmer'
import { RETENTION_SCHEDULE } from '@/platform/payload/retentionJobs'

import { deleteConfirmations, deleteUnconfirmedBefore, findConfirmedBefore } from './store'

/** How many records one run deleted. */
export type ConfirmationsDeleted = { unconfirmed: number; confirmed: number }

/**
 * Applies the owner's retention rules to the confirmed and unconfirmed addresses (#274):
 * - an address never confirmed goes 48 hours after its last link;
 * - a confirmed one goes 12 months after it was confirmed, unless a keeper still needs it (a
 *   message still kept, which means one from the last 12 months or on hold; an account).
 * A keeper that fails stops the run before anything confirmed is deleted; the next run tries
 * again.
 */
export async function deleteExpiredConfirmations(
  req: PayloadRequest,
  keepers: readonly ConfirmedEmailKeeper[],
  now = Date.now(),
): Promise<ConfirmationsDeleted> {
  const unconfirmed = await deleteUnconfirmedBefore(req, toUnconfirmedCutoff(now))

  const candidates = await findConfirmedBefore(req, toConfirmedCutoff(now))
  if (candidates.length === 0) return { unconfirmed, confirmed: 0 }

  const emails = candidates.map(({ email }) => email)
  const kept = new Set<string>()
  for (const keeper of keepers) {
    for (const email of await keeper(emails, req)) kept.add(email)
  }
  const expired = candidates.filter(({ email }) => !kept.has(email)).map(({ id }) => id)
  return { unconfirmed, confirmed: await deleteConfirmations(req, expired) }
}

/** The task's slug in Payload's jobs queue. */
export const CONFIRMATION_RETENTION_TASK = 'deleteExpiredEmailConfirmations'

/**
 * The hourly retention task for this collection, for `payload.config.ts` to register with the
 * keepers the other modules bring (decision 0008). It logs counts only, never an address.
 */
export const createConfirmationRetentionTask = ({
  keepers,
}: {
  keepers: readonly ConfirmedEmailKeeper[]
}): TaskConfig<{ input: object; output: ConfirmationsDeleted }> => ({
  slug: CONFIRMATION_RETENTION_TASK,
  label: 'Delete expired email confirmations',
  schedule: RETENTION_SCHEDULE,
  handler: async ({ req }) => {
    const deleted = await deleteExpiredConfirmations(req, keepers)
    req.payload.logger.info(
      `Retention: deleted ${deleted.unconfirmed} unconfirmed and ${deleted.confirmed} confirmed email confirmations`,
    )
    return { output: deleted }
  },
})
