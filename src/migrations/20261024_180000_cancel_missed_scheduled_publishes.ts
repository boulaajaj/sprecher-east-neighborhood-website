import type { MigrateUpArgs } from '@payloadcms/db-sqlite'
import type { Where } from 'payload'

/** What a cancelled job's error says, in Admin's jobs list. */
export const MISSED_SCHEDULE_MESSAGE =
  'Missed while scheduled publishing was off (#141); not run. Schedule it again if still wanted.'

/**
 * Data only (#141). Until scheduled publishing got its runner, nothing ran the `default` queue,
 * so every publish or unpublish scheduled before this deploy is still waiting, and the first
 * run would carry them all out at once, including ones editors have forgotten (Admin lists only
 * schedules still ahead). Each one that was due before this migration is marked failed with an
 * explanation instead, so nothing on the site changes unexpectedly; editors can schedule again.
 * Schedules still ahead are left alone. Prints only the count, as a deploy notice.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const now = new Date().toISOString()
  const where: Where = {
    and: [
      { taskSlug: { equals: 'schedulePublish' } },
      { waitUntil: { less_than: now } },
      { completedAt: { exists: false } },
      { hasError: { not_equals: true } },
      { processing: { not_equals: true } },
    ],
  }
  const { totalDocs } = await payload.db.count({ collection: 'payload-jobs', where, req })
  if (totalDocs > 0) {
    await payload.db.updateMany({
      collection: 'payload-jobs',
      where,
      data: { hasError: true, completedAt: now, error: { message: MISSED_SCHEDULE_MESSAGE } },
      req,
    })
  }
  // A GitHub Actions notice line: the deploy shows it on the run
  process.stdout.write(
    `::notice title=Scheduled publishing::${totalDocs} missed schedule(s) cancelled, not run\n`,
  )
}

// Nothing to undo: running the missed schedules now is what this migration exists to prevent.
export async function down(): Promise<void> {}
