import type { Access, CollectionBeforeChangeHook, CollectionConfig, FieldHook } from 'payload'

import { hasAdmin, hasAgent, isAdmin } from '@/platform/payload/roles'

import { REVIEW_ITEM_KINDS, SUGGESTION_CAPS } from '../domain/suggestion'

/** The run history of the neighborhood agents (#336, #255): what each run checked and found. */
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

const COMMIT = /^[0-9a-f]{7,40}$/

const text = (name: string, maxLength: number, required = false) =>
  ({ name, type: 'text', maxLength, required }) as const
const count = (name: string) => ({ name, type: 'number', min: 0, defaultValue: 0 }) as const

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
    useAsTitle: 'agentName',
    defaultColumns: ['agentName', 'status', 'startedAt', 'repoCommit', 'counts.proposed'],
    description: 'What each neighborhood agent run checked and suggested (read-only history).',
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
    text('agentName', 100, true),
    {
      ...text('repoCommit', 40, true),
      validate: (value: unknown) =>
        (typeof value === 'string' && COMMIT.test(value)) || 'A git commit hash (7 to 40 hex).',
      admin: { description: 'The commit of the agents’ prompts and code this run used.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'running',
      options: ['running', 'succeeded', 'failed'],
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'finishedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'sources',
      type: 'array',
      maxRows: 100,
      admin: { description: 'Each source checked, with the cursor to resume from next time.' },
      fields: [
        text('name', 200, true),
        text('url', 2000),
        text('cursor', 2000),
        { name: 'checkedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'counts',
      type: 'group',
      fields: [count('seen'), count('proposed'), count('rejected'), count('duplicates')],
    },
    {
      name: 'errorMessages',
      type: 'array',
      maxRows: 50,
      fields: [text('message', 1000, true)],
    },
    { name: 'cost', type: 'number', min: 0, admin: { description: 'In US dollars.' } },
    {
      name: 'reviewItems',
      type: 'array',
      maxRows: 200,
      hooks: { beforeChange: [keepReviewItems] },
      admin: {
        description: 'What the agent asks an editor to look at. It never changed the content.',
      },
      fields: [
        { name: 'kind', type: 'select', required: true, options: [...REVIEW_ITEM_KINDS] },
        { name: 'targetCollection', type: 'select', options: ['events', 'posts'] },
        { name: 'targetId', type: 'number' },
        text('externalId', SUGGESTION_CAPS.externalId),
        { ...text('summary', SUGGESTION_CAPS.summary, true), type: 'textarea' },
        {
          name: 'evidence',
          type: 'text',
          hasMany: true,
          maxRows: SUGGESTION_CAPS.evidenceItems,
          maxLength: SUGGESTION_CAPS.evidence,
        },
        {
          name: 'flags',
          type: 'text',
          hasMany: true,
          maxRows: SUGGESTION_CAPS.flags,
          maxLength: SUGGESTION_CAPS.flag,
        },
        text('sourceUrl', SUGGESTION_CAPS.sourceUrl, true),
        { name: 'reportedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
  ],
  timestamps: true,
}
