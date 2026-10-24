import type { PayloadRequest, TaskConfig } from 'payload'

import { toConfirmedCutoff, toUnconfirmedCutoff } from '@/platform/lib'
import type { ConfirmedEmailKeeper } from '@/platform/payload/emailConfirmer'
import { RETENTION_SCHEDULE } from '@/platform/payload/retentionJobs'

import { needsRecentSenders, type SubmissionAge, toExpiredSubmissionIds } from '../domain/retention'
import { FORM_SUBMISSIONS } from '../domain/senderEmail'

// Submissions are admin-only, and the task runs as nobody, so every query here bypasses access
// on purpose. It reads only the fields the rules need, never a message's content.

/**
 * The messages the rules could delete now, not on hold: unconfirmed ones older than 48 hours, and
 * any older than 12 months. `toExpiredSubmissionIds` makes the decision.
 */
async function findCandidates(req: PayloadRequest, now: number): Promise<SubmissionAge[]> {
  const { docs } = await req.payload.find({
    collection: FORM_SUBMISSIONS,
    where: {
      and: [
        { retentionHold: { not_equals: true } },
        {
          or: [
            {
              and: [
                { createdAt: { less_than: toUnconfirmedCutoff(now) } },
                { emailConfirmed: { not_equals: true } },
              ],
            },
            { createdAt: { less_than: toConfirmedCutoff(now) } },
          ],
        },
      ],
    },
    select: { createdAt: true, senderEmail: true, emailConfirmed: true, retentionHold: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return docs
}

/** The addresses that sent a message in the last 12 months. */
async function findRecentSenders(req: PayloadRequest, now: number): Promise<Set<string>> {
  const { docs } = await req.payload.find({
    collection: FORM_SUBMISSIONS,
    where: {
      and: [
        { createdAt: { greater_than_equal: toConfirmedCutoff(now) } },
        { senderEmail: { exists: true } },
      ],
    },
    select: { senderEmail: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return new Set(docs.flatMap(({ senderEmail }) => (senderEmail ? [senderEmail] : [])))
}

/** Applies the owner's retention rules to the stored messages (#274), and says how many went. */
export async function deleteExpiredSubmissions(
  req: PayloadRequest,
  now = Date.now(),
): Promise<number> {
  const candidates = await findCandidates(req, now)
  const recentSenders = needsRecentSenders(candidates, now)
    ? await findRecentSenders(req, now)
    : new Set<string>()
  const expired = toExpiredSubmissionIds(candidates, recentSenders, now)
  if (expired.length === 0) return 0
  const { docs } = await req.payload.delete({
    collection: FORM_SUBMISSIONS,
    where: { id: { in: expired } },
    select: { createdAt: true },
    depth: 0,
    overrideAccess: true,
    req,
  })
  return docs.length
}

/**
 * For the verification module (#274): a confirmed address stays while a message from it is still
 * kept, because it was sent in the last 12 months or is on hold. `payload.config.ts` hands it
 * over (decision 0008).
 */
export const keepSendersWithMessages: ConfirmedEmailKeeper = async (emails, req) => {
  if (emails.length === 0) return new Set()
  const { docs } = await req.payload.find({
    collection: FORM_SUBMISSIONS,
    where: { senderEmail: { in: [...emails] } },
    select: { senderEmail: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return new Set(docs.flatMap(({ senderEmail }) => (senderEmail ? [senderEmail] : [])))
}

/** The task's slug in Payload's jobs queue. */
export const CONTACT_RETENTION_TASK = 'deleteExpiredContactMessages'

/** The hourly retention task for contact messages. It logs a count only, never an address. */
export const contactRetentionTask: TaskConfig<{ input: object; output: { deleted: number } }> = {
  slug: CONTACT_RETENTION_TASK,
  label: 'Delete expired contact messages',
  schedule: RETENTION_SCHEDULE,
  handler: async ({ req }) => {
    const deleted = await deleteExpiredSubmissions(req)
    req.payload.logger.info(`Retention: deleted ${deleted} contact messages`)
    return { output: { deleted } }
  },
}
