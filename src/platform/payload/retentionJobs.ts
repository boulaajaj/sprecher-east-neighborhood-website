import type { TaskConfig, Where } from 'payload'

/**
 * The jobs queue the retention tasks run in (#274). `payload.config.ts` runs only this queue in
 * the app's own process (`jobs.autoRun`); scheduled publishing's queue is left alone (#141).
 */
export const RETENTION_QUEUE = 'retention'

/** How often the runner looks for due jobs in that queue: every 10 minutes. */
export const RETENTION_RUNNER_CRON = '*/10 * * * *'

type ScheduleConfig = NonNullable<TaskConfig['schedule']>[number]
type BeforeSchedule = NonNullable<NonNullable<ScheduleConfig['hooks']>['beforeSchedule']>

/** A retention run takes milliseconds: a job still "processing" after this was cut off. */
export const STUCK_AFTER_MS = 60 * 60 * 1000

/**
 * Before scheduling, puts back in the queue a retention job left "processing", for example by a
 * restart in the middle of a run. Payload 3.91 has no timeout for that, and its default check
 * counts such a job as running, so the task would never be scheduled again and deletion would
 * stop without a sign (#274). Re-running is safe: each task deletes only what is due at the time.
 * Logs a warning, then lets Payload's default check decide.
 */
export const releaseStuckJobs: BeforeSchedule = async (args) => {
  const { queueable, req } = args
  const where: Where = {
    and: [
      { queue: { equals: RETENTION_QUEUE } },
      { taskSlug: { equals: queueable.taskConfig?.slug } },
      { processing: { equals: true } },
      { completedAt: { exists: false } },
      { updatedAt: { less_than: new Date(Date.now() - STUCK_AFTER_MS).toISOString() } },
    ],
  }
  const { totalDocs } = await req.payload.db.count({ collection: 'payload-jobs', where, req })
  if (totalDocs > 0) {
    await req.payload.db.updateMany({
      collection: 'payload-jobs',
      where,
      data: { processing: false },
      req,
    })
    req.payload.logger.warn(
      `Retention: ${totalDocs} ${queueable.taskConfig?.slug} job(s) were stuck in processing; queued again`,
    )
  }
  return args.defaultBeforeSchedule(args)
}

/** When each retention task is scheduled: every hour, on the hour. */
export const RETENTION_SCHEDULE: NonNullable<TaskConfig['schedule']> = [
  { cron: '0 * * * *', queue: RETENTION_QUEUE, hooks: { beforeSchedule: releaseStuckJobs } },
]

/** A database error's code (`SQLITE_BUSY`…), from the error or one it wraps; never its text. */
function errorCode(error: unknown): string | null {
  for (let e: unknown = error, depth = 0; e && depth < 4; depth++) {
    const code = (e as { code?: unknown }).code
    if (typeof code === 'string' && /^[A-Z][A-Z0-9_]*$/.test(code)) return code
    e = (e as { cause?: unknown }).cause
  }
  return null
}

/**
 * Runs a retention task's work, and replaces a failure with an error that says only which task
 * failed, the error's name and its code. Payload logs a task's error and stores it on the job,
 * and a failed query's message lists its parameters: the email addresses the task looked up.
 */
export async function withoutPersonalData<T>(task: string, work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    const name = error instanceof Error ? error.name : 'Error'
    const code = errorCode(error)
    throw new Error(`Retention task ${task} failed (${code ? `${name} ${code}` : name})`)
  }
}
