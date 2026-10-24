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
export const SOURCE_CHECK_STATUSES = ['ok', 'not-modified', 'error', 'skipped', 'blocked'] as const

/** The last way a run tried a source: a plain fetch, a headless browser, or none (not polled). */
export const FETCH_USED = ['direct', 'playwright', 'none'] as const

/** What a run writes once and never changes afterwards. */
export const RUN_IDENTITY = [
  'runId',
  'agentName',
  'pipelineVersion',
  'repoCommit',
  'startedAt',
] as const
