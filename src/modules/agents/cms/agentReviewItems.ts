import type { Access, CollectionBeforeChangeHook, CollectionConfig, TextField } from 'payload'

import { hasAdmin, hasAdminOrEditor, hasAgent, isAdmin } from '@/platform/payload/roles'

import { REVIEW_FLAGS, REVIEW_ITEM_KINDS, SUGGESTION_CAPS as CAPS } from '../domain/suggestion'
import { AGENT_REVIEW_ITEMS, AGENT_RUNS } from './agentRuns'

/**
 * What an agent asks an editor to look at (#336), one document per report so two reports never
 * overwrite each other: something to review, an update or a cancellation to existing content,
 * or a source item it rejected. Added only by `reportItem`; it never changes the content it
 * points at. Each belongs to one of the agent's runs, and shows under that run in Admin.
 */

/** Staff read every item, to act on it; an agent only its own. */
const staffOrOwnItems: Access = ({ req: { user } }) => {
  if (hasAdminOrEditor(user)) return true
  if (user && hasAgent(user)) return { agent: { equals: user.id } }
  return false
}

/** Admins and agents add items; an agent only to one of its own runs (checked below). */
const isAdminOrAgent: Access = ({ req: { user } }) => hasAdmin(user) || hasAgent(user)

/**
 * The item's agent is whoever reported it, set by the server, and an agent may only report on
 * its own run: the run is read with the agent's own access, so another agent's run is refused.
 */
const recordReporter: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'create') return { ...data, agent: originalDoc?.agent ?? null }
  if (!hasAgent(req.user)) return data
  await req.payload.findByID({
    collection: AGENT_RUNS,
    id: data.run,
    depth: 0,
    overrideAccess: false,
    user: req.user,
  })
  return { ...data, agent: req.user?.id }
}

const DAY_AND_TIME = { date: { pickerAppearance: 'dayAndTime' } } as const
const text = (name: string, maxLength: number, required = false): TextField => ({
  name,
  type: 'text',
  maxLength,
  required,
})

export const AgentReviewItems: CollectionConfig = {
  slug: AGENT_REVIEW_ITEMS,
  access: {
    create: isAdminOrAgent,
    read: staffOrOwnItems,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: 'Agents',
    useAsTitle: 'summary',
    defaultColumns: ['kind', 'summary', 'targetCollection', 'targetId', 'createdAt'],
    description: 'What the agents ask an editor to look at. They never changed the content.',
  },
  defaultSort: '-createdAt',
  hooks: { beforeChange: [recordReporter] },
  fields: [
    {
      name: 'run',
      type: 'relationship',
      relationTo: AGENT_RUNS,
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'kind', type: 'select', required: true, index: true, options: [...REVIEW_ITEM_KINDS] },
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
    // Empty only for a rejected-invalid report whose item had no source link
    text('sourceUrl', CAPS.sourceUrl),
  ],
  timestamps: true,
}
