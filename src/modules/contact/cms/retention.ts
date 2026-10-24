import type { PayloadRequest, TaskConfig, Where } from 'payload'

import { toConfirmedCutoff, toUnconfirmedCutoff } from '@/platform/lib'
import type { ConfirmedEmailKeeper } from '@/platform/payload/emailConfirmer'
import { RETENTION_SCHEDULE, withoutPersonalData } from '@/platform/payload/retentionJobs'

import { needsRecentSenders, type SubmissionAge, toExpiredSubmissionIds } from '../domain/retention'
import { asksForEmail, FORM_SUBMISSIONS, type FormFieldShape } from '../domain/senderEmail'

// Submissions are admin-only, and the task runs as nobody, so every query here bypasses access
// on purpose. It reads only the fields the rules need, never a message's content.

/**
 * What a message must still be, at the moment it is deleted: not on hold, and either unconfirmed
 * and older than 48 hours, or older than 12 months. The candidate query uses it, and so does the
 * delete itself, so a hold set or a confirmation made in between keeps the message (#274).
 */
const deletableNow = (now: number): Where => ({
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
})

/**
 * The messages the rules could delete now, not on hold: unconfirmed ones older than 48 hours, and
 * any older than 12 months. `toExpiredSubmissionIds` makes the decision.
 */
async function findCandidates(req: PayloadRequest, now: number): Promise<SubmissionAge[]> {
  const { docs } = await req.payload.find({
    collection: FORM_SUBMISSIONS,
    where: deletableNow(now),
    select: {
      createdAt: true,
      form: true,
      senderEmail: true,
      emailConfirmed: true,
      retentionHold: true,
    },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return docs.map((doc) => ({
    ...doc,
    form: typeof doc.form === 'object' && doc.form ? doc.form.id : doc.form,
  }))
}

/** The forms that ask for an email (a handful: all of them are read). */
async function findFormsAskingForEmail(req: PayloadRequest): Promise<Set<number>> {
  const { docs } = await req.payload.find({
    collection: 'forms',
    select: { fields: true },
    pagination: false,
    depth: 0,
    // Forms are public; the task runs as nobody, and reads only which fields each one has
    overrideAccess: true,
    req,
  })
  return new Set(
    docs.filter((form) => asksForEmail(form.fields as FormFieldShape[])).map(({ id }) => id),
  )
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
  if (candidates.length === 0) return 0
  // A message without an address that isn't confirmed: does its form ask for one?
  const formsAskingForEmail = candidates.some((c) => !c.senderEmail && c.emailConfirmed !== true)
    ? await findFormsAskingForEmail(req)
    : new Set<number>()
  const recentSenders = needsRecentSenders(candidates, now)
    ? await findRecentSenders(req, now)
    : new Set<string>()
  const expired = toExpiredSubmissionIds(candidates, { formsAskingForEmail, recentSenders }, now)
  if (expired.length === 0) return 0
  // One DELETE statement that checks the conditions again, row by row, as it deletes. Payload's
  // `delete` finds first and then deletes each id, which would act on the earlier answer. No hooks
  // or versions are skipped: the collection has neither on delete
  await req.payload.db.deleteMany({
    collection: FORM_SUBMISSIONS,
    where: { and: [{ id: { in: expired } }, deletableNow(now)] },
    req,
  })
  const { totalDocs: left } = await req.payload.count({
    collection: FORM_SUBMISSIONS,
    where: { id: { in: expired } },
    overrideAccess: true,
    req,
  })
  return expired.length - left
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
    const deleted = await withoutPersonalData(CONTACT_RETENTION_TASK, () =>
      deleteExpiredSubmissions(req),
    )
    req.payload.logger.info(`Retention: deleted ${deleted} contact messages`)
    return { output: { deleted } }
  },
}
