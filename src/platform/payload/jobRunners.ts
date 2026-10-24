import type { Config } from 'payload'

import { RETENTION_QUEUE, RETENTION_RUNNER_CRON } from './retentionJobs'

type AutoRun = NonNullable<Config['jobs']>['autoRun']
type RunnerConfig = Extract<NonNullable<AutoRun>, unknown[]>[number]

/**
 * The queue Payload's scheduled publishing uses (#141). Its Admin "Schedule" button queues the
 * built-in `schedulePublish` task without naming a queue, so Payload puts it in `default`.
 */
export const SCHEDULED_PUBLISH_QUEUE = 'default'

/** How often the runner looks for due publishes: every minute, the Admin's time precision. */
export const SCHEDULED_PUBLISH_RUNNER_CRON = '* * * * *'

/**
 * At most this many due publishes per run. One publish is one document update with its cache
 * refresh; more due at the same minute wait for the next run.
 */
export const SCHEDULED_PUBLISH_RUN_LIMIT = 10

/**
 * The job runners Payload starts inside the app's one PM2 process (`jobs.autoRun`): no separate
 * worker and no system cron (decisions 0010 and 0011). Payload starts them on the first request
 * through its own routes after a start (any `/api/` request, the admin), never during
 * `next build`, and never starts a run while the previous run of the same runner is still going.
 * Each runner names its queue: one that runs every queue would pick up work nobody decided to run.
 */
export const JOB_RUNNERS: RunnerConfig[] = [
  { cron: RETENTION_RUNNER_CRON, queue: RETENTION_QUEUE },
  {
    cron: SCHEDULED_PUBLISH_RUNNER_CRON,
    queue: SCHEDULED_PUBLISH_QUEUE,
    limit: SCHEDULED_PUBLISH_RUN_LIMIT,
  },
]
