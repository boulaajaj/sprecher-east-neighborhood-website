import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionConfig,
  Field,
  FieldHook,
  TextField,
} from 'payload'

import { hasAdmin, hasAgent, isAdmin } from '@/platform/payload/roles'

import { RUN_STATUSES, SOURCE_CHECK_STATUSES } from '../domain/runs'
import { REVIEW_FLAGS, REVIEW_ITEM_KINDS, SUGGESTION_CAPS as CAPS } from '../domain/suggestion'

/**
 * The run history of the neighborhood agents (#336, #255): one document per run, with the fields
 * of `intelligence/schemas/agent-run.schema.json` (#344), plus the review items `reportItem` adds.
 */
export const AGENT_RUNS = 'agent-runs' as const

/** Admins and agents start runs. */
const isAdminOrAgent: Access = ({ req: { user } }) => hasAdmin(user) || hasAgent(user)

/** Admins see every run; an agent only its own, which is how it resumes from its cursors. */
const adminOrOwnRuns: Access = ({ req: { user } }) => {
  if (hasAdmin(user)) return true
  if (user && hasAgent(user)) return { agent: { equals: user.id } }
  return false
}

/** The run's agent is whoever created it, set by the server and never changed afterwards. */
const recordRunAgent: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  if (operation === 'create') {
    return { ...data, agent: hasAgent(req.user) ? req.user?.id : (data.agent ?? null) }
  }
  return { ...data, agent: originalDoc?.agent ?? null }
}

/** Set in a request's context by `reportItem`, the one way an agent adds review items. */
export const APPENDING_REVIEW_ITEM = 'appendingReviewItem'

/**
 * Review items are for editors: an agent adds them only through `reportItem`, and can't rewrite
 * or remove them by updating its run.
 */
const keepReviewItems: FieldHook = ({ context, originalDoc, req, value }) => {
  if (!hasAgent(req.user) || context[APPENDING_REVIEW_ITEM]) return value
  return originalDoc?.reviewItems ?? []
}

const COMMIT = /^[a-f0-9]{40}$/
const SOURCE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DAY_AND_TIME = { date: { pickerAppearance: 'dayAndTime' } } as const

const text = (name: string, maxLength: number, required = false): TextField => ({
  name,
  type: 'text',
  maxLength,
  required,
})
const matching = (field: TextField, pattern: RegExp, message: string): TextField => ({
  ...field,
  validate: (value: unknown) =>
    value === null || value === undefined || (typeof value === 'string' && pattern.test(value))
      ? true
      : message,
})
const count = (name: string): Field => ({ name, type: 'number', min: 0, defaultValue: 0 })

const REVIEW_ITEM_FIELDS: Field[] = [
  { name: 'kind', type: 'select', required: true, options: [...REVIEW_ITEM_KINDS] },
  { name: 'targetCollection', type: 'select', options: ['events', 'posts'] },
  { name: 'targetId', type: 'number', min: 1 },
  text('externalId', CAPS.externalId),
  { name: 'summary', type: 'textarea', maxLength: CAPS.summary, required: true },
  {
    name: 'evidence',
    type: 'array',
    maxRows: CAPS.evidenceItems,
    fields: [
      text('url', CAPS.sourceUrl, true),
      text('says', CAPS.evidenceSays, true),
      { name: 'retrievedAt', type: 'date', required: true, admin: DAY_AND_TIME },
    ],
  },
  { name: 'flags', type: 'select', hasMany: true, options: [...REVIEW_FLAGS] },
  text('sourceUrl', CAPS.sourceUrl, true),
  { name: 'reportedAt', type: 'date', admin: DAY_AND_TIME },
]

export const AgentRuns: CollectionConfig = {
  slug: AGENT_RUNS,
  access: {
    create: isAdminOrAgent,
    read: adminOrOwnRuns,
    update: adminOrOwnRuns,
    delete: isAdmin,
  },
  admin: {
    group: 'Agents',
    useAsTitle: 'runId',
    defaultColumns: ['runId', 'agentName', 'status', 'startedAt', 'counts.proposed'],
    description: 'What each neighborhood agent run checked, suggested and asks editors to review.',
  },
  defaultSort: '-startedAt',
  hooks: { beforeChange: [recordRunAgent] },
  fields: [
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'Set from the API key.' },
    },
    { ...text('runId', CAPS.runId, true), unique: true, index: true },
    text('agentName', 100, true),
    { name: 'pipelineVersion', type: 'number', min: 1, required: true },
    matching(text('repoCommit', 40, true), COMMIT, 'A full git commit hash (40 hex).'),
    { name: 'startedAt', type: 'date', required: true, admin: DAY_AND_TIME },
    { name: 'finishedAt', type: 'date', admin: DAY_AND_TIME },
    { name: 'status', type: 'select', required: true, options: [...RUN_STATUSES] },
    {
      name: 'sourcesChecked',
      type: 'array',
      maxRows: 200,
      fields: [
        matching(text('sourceId', 100, true), SOURCE_ID, 'A source id from the registry.'),
        text('cursor', 300),
        { name: 'status', type: 'select', required: true, options: [...SOURCE_CHECK_STATUSES] },
        text('error', 500),
      ],
    },
    {
      name: 'counts',
      type: 'group',
      fields: ['seen', 'proposed', 'updates', 'rejected', 'duplicates', 'needsReview'].map(count),
    },
    { name: 'errors', type: 'text', hasMany: true, maxRows: 50, maxLength: 500 },
    {
      name: 'cost',
      type: 'group',
      fields: [
        count('inputTokens'),
        count('outputTokens'),
        { name: 'usd', type: 'number', min: 0, admin: { description: 'In US dollars.' } },
      ],
    },
    {
      name: 'reviewItems',
      type: 'array',
      maxRows: 200,
      hooks: { beforeChange: [keepReviewItems] },
      admin: {
        description: 'What the agent asks an editor to look at. It never changed the content.',
      },
      fields: REVIEW_ITEM_FIELDS,
    },
  ],
  timestamps: true,
}
