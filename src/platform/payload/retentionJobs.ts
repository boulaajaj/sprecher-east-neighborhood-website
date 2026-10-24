import type { TaskConfig } from 'payload'

/**
 * The jobs queue the retention tasks run in (#274). `payload.config.ts` runs only this queue in
 * the app's own process (`jobs.autoRun`); scheduled publishing's queue is left alone (#141).
 */
export const RETENTION_QUEUE = 'retention'

/** When each retention task is scheduled: every hour, on the hour. */
export const RETENTION_SCHEDULE: NonNullable<TaskConfig['schedule']> = [
  { cron: '0 * * * *', queue: RETENTION_QUEUE },
]

/** How often the runner looks for due jobs in that queue: every 10 minutes. */
export const RETENTION_RUNNER_CRON = '*/10 * * * *'
