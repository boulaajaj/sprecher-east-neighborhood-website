import type { AgentRun, Category, Event, Post } from '@/payload-types'

import type { AgentViews } from '../domain/agentView'
import { AGENT_RUNS } from './agentRuns'

/**
 * The fields an agent may see over MCP, per collection (#336). Each list is checked against the
 * generated type, so a renamed or removed field fails `tsc` instead of silently disappearing from
 * what the agent reads. Nothing personal: no authors, rich text, users or form submissions.
 */

type Keys<T> = readonly (keyof T & string)[]

const REVIEW_QUEUE = [
  '_status',
  'moderationStatus',
  'sourceName',
  'sourceUrl',
  'externalId',
  'contentHash',
  'audience',
  'createdAt',
  'updatedAt',
] as const

const EVENT_VIEW = [
  'id',
  'title',
  'slug',
  'date',
  'timeStart',
  'timeEnd',
  'cancelled',
  'category',
  'locationType',
  'locationName',
  'locationAddress',
  'mapsUrl',
  'registrationUrl',
  'description',
  ...REVIEW_QUEUE,
] as const satisfies Keys<Event>

const POST_VIEW = [
  'id',
  'title',
  'slug',
  'categories',
  'publishedAt',
  'meta',
  ...REVIEW_QUEUE,
] as const satisfies Keys<Post>

const CATEGORY_VIEW = ['id', 'title', 'slug', 'parent'] as const satisfies Keys<Category>

/** Everything of its own run an agent needs to resume: its id, cursors, counts and errors. */
const RUN_VIEW = [
  'id',
  'runId',
  'agent',
  'agentName',
  'pipelineVersion',
  'repoCommit',
  'status',
  'startedAt',
  'finishedAt',
  'sourcesChecked',
  'counts',
  'errors',
  'cost',
  'createdAt',
  'updatedAt',
] as const satisfies Keys<AgentRun>

export const AGENT_VIEWS: AgentViews = {
  events: EVENT_VIEW,
  posts: POST_VIEW,
  categories: CATEGORY_VIEW,
  [AGENT_RUNS]: RUN_VIEW,
}
