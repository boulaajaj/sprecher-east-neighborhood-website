import type { SanitizedConfig } from 'payload'

import { isAdmin } from './roles'

const JOB_STATS = 'payload-jobs-stats'

/**
 * When a task has a schedule (the retention tasks, #274), Payload 3.91 adds this global to record
 * when each one was last scheduled, with its default access (any signed-in user) and no option to
 * override it, so the rule is set on the built config instead, as for edit locks. A resident
 * could otherwise rewrite the record and stop the retention tasks from being scheduled. Payload
 * writes it through the database adapter, which checks no access, so the scheduler is
 * unaffected.
 */
export function restrictJobStats(config: SanitizedConfig): SanitizedConfig {
  const stats = config.globals.find((global) => global.slug === JOB_STATS)
  if (stats) {
    stats.access = { ...stats.access, read: isAdmin, update: isAdmin }
  }
  return config
}
