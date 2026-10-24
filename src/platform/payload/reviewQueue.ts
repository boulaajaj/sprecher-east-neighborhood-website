import {
  type CollectionBeforeChangeHook,
  type CollectionSlug,
  type Payload,
  type TypedUser,
  type Field,
  type FieldHook,
  ValidationError,
} from 'payload'

import {
  approveOnPublish,
  AUDIENCES,
  blankToNull,
  isHttpUrl,
  MODERATION_STATUSES,
  toHeldSuggestion,
} from '../lib/reviewQueue'
import { hasAdminOrEditor } from './roles'

/**
 * The review queue on events and posts (#123): where a suggestion came from, who it's for, and
 * where it is in review. Suggestions from outside staff wait here as drafts until staff publish
 * them; `externalId` and `contentHash` are unique where set, so the same item can't be stored
 * twice.
 */

const SIDEBAR = { position: 'sidebar' } as const
const blankIsNull: FieldHook = ({ value }) => blankToNull(value)

export const REVIEW_QUEUE_FIELDS: Field[] = [
  {
    name: 'moderationStatus',
    type: 'select',
    label: 'Review status',
    options: [...MODERATION_STATUSES],
    index: true,
    admin: {
      ...SIDEBAR,
      description: 'Set on suggestions from outside sources. Empty for content staff write.',
    },
  },
  {
    name: 'sourceName',
    type: 'text',
    label: 'Source',
    hooks: { beforeValidate: [blankIsNull] },
    admin: { ...SIDEBAR, description: 'Who published this first, for example a city calendar.' },
  },
  {
    name: 'sourceUrl',
    type: 'text',
    label: 'Source link',
    hooks: { beforeValidate: [blankIsNull] },
    validate: (value: unknown) =>
      value === null || value === undefined || isHttpUrl(value) || 'Enter a full http(s) link.',
    admin: SIDEBAR,
  },
  {
    name: 'externalId',
    type: 'text',
    label: 'Source ID',
    unique: true,
    index: true,
    hooks: { beforeValidate: [blankIsNull] },
    admin: { ...SIDEBAR, description: 'The source’s own ID; the same one can’t be stored twice.' },
  },
  {
    name: 'contentHash',
    type: 'text',
    label: 'Content fingerprint',
    unique: true,
    index: true,
    hooks: { beforeValidate: [blankIsNull] },
    admin: { ...SIDEBAR, description: 'A fingerprint of the content; it can’t be stored twice.' },
  },
  {
    name: 'audience',
    type: 'select',
    hasMany: true,
    options: [...AUDIENCES],
    admin: SIDEBAR,
  },
]

/**
 * How many suggestions wait for review, as the admin list counts them: from each document's
 * latest draft (`draft: true`), since a status changed with Save Draft is stored only in the
 * version history, not on the collection row. With the user's own access.
 */
export async function countSuggestions(
  payload: Payload,
  collection: CollectionSlug,
  user: TypedUser | undefined,
): Promise<number> {
  const { totalDocs } = await payload.find({
    collection,
    draft: true,
    where: { moderationStatus: { equals: 'suggested' } },
    limit: 1,
    depth: 0,
    select: {},
    overrideAccess: false,
    user,
  })
  return totalDocs
}

/** The admin list slot that filters the list to suggestions waiting for review. */
export const SUGGESTIONS_FILTER = '@/platform/payload/admin/SuggestionsFilter'

/**
 * Holds what doesn't come from staff: a write over REST, GraphQL or MCP, or a Local API call made
 * as a non-staff user, is stored as a draft, and a create also becomes a `suggested` item that
 * must name its source. Our own server code calling the Local API with no user (the seed) is left
 * alone. When staff publish a suggestion, it's approved.
 */
export const holdSuggestions: CollectionBeforeChangeHook = ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (hasAdminOrEditor(req.user)) return approveOnPublish(data, originalDoc)
  if (req.payloadAPI === 'local' && !req.user) return data
  if (operation !== 'create') return { ...data, _status: 'draft' }

  const held = toHeldSuggestion(data)
  if ('problems' in held) {
    throw new ValidationError({ collection: collection.slug, errors: held.problems, req })
  }
  return held.data
}
