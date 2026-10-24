/** A run's statuses, as `intelligence/schemas/agent-run.schema.json` lists them (#344). */
export const RUN_STATUSES = [
  'running',
  'succeeded',
  'partial',
  'failed',
  'stopped-budget',
  'disabled',
] as const

/** How checking one source went in a run. */
export const SOURCE_CHECK_STATUSES = ['ok', 'not-modified', 'error', 'skipped'] as const
