import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { APIError, type PayloadRequest, type RichTextField, ValidationError } from 'payload'

import { SITE_TIMEZONE } from '@/platform/lib/timezone'

import { toEventSchedule, toSuggestionSlug } from '../../domain/suggestion'
import { findOwnRun, toToolAnswer } from './runs'
import { submitSuggestionInput, submitSuggestionShape, type SubmitSuggestionInput } from './schemas'

type Outcome = { status: 'created' | 'duplicate'; id: number }

/** The collection's rich-text `content`, in its own editor's nodes, from Markdown. */
function toContent(req: PayloadRequest, input: SubmitSuggestionInput) {
  const field = req.payload.collections[input.collection].config.flattenedFields.find(
    (f): f is RichTextField => f.name === 'content' && f.type === 'richText',
  )
  if (!field) throw new APIError(`${input.collection} has no content field`, 500)
  const editorConfig = editorConfigFactory.fromField({ field })
  return convertMarkdownToLexical({ editorConfig, markdown: input.bodyMarkdown })
}

/** The fields to store: the content, the provenance, and for an event its day, times and place. */
function toData(req: PayloadRequest, input: SubmitSuggestionInput): Record<string, unknown> {
  const shared = {
    title: input.title,
    slug: toSuggestionSlug(input.title, input.contentHash),
    content: toContent(req, input),
    _status: 'draft',
    moderationStatus: 'suggested',
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    externalId: input.externalId,
    contentHash: input.contentHash,
    audience: input.audience,
  }
  if (input.collection === 'posts') return shared
  if (!input.startsAt) throw new APIError('An event needs startsAt.', 400, null, true)
  return {
    ...shared,
    ...toEventSchedule({ ...input, startsAt: input.startsAt }, SITE_TIMEZONE),
    locationName: input.venue || null,
    locationAddress: input.address || null,
  }
}

/**
 * The item already stored with this source ID or fingerprint, if any. Read with access bypassed:
 * suggestions are drafts the agent can't read, and only the id goes back to it.
 */
async function findDuplicate(req: PayloadRequest, input: SubmitSuggestionInput) {
  const { docs } = await req.payload.find({
    collection: input.collection,
    where: {
      or: [
        { externalId: { equals: input.externalId } },
        { contentHash: { equals: input.contentHash } },
      ],
    },
    limit: 1,
    depth: 0,
    select: {},
    overrideAccess: true,
  })
  return docs[0]?.id ?? null
}

const isUniqueRefusal = (error: unknown) =>
  error instanceof ValidationError &&
  error.data.errors.some((e) => e.path === 'externalId' || e.path === 'contentHash')

/**
 * Stores a suggestion as an unpublished draft with status `suggested` and its source, as the
 * agent (its own access applies, and `holdSuggestions` holds it whatever it sends). The same
 * source ID or fingerprint answers `duplicate` with the stored item's id instead of an error.
 * The run's counts are the agent's own to keep in its run log, so this tool doesn't touch them.
 */
export async function submitSuggestion(
  req: PayloadRequest,
  input: SubmitSuggestionInput,
): Promise<Outcome> {
  await findOwnRun(req, input.runId)
  const existing = await findDuplicate(req, input)
  if (existing !== null) return { status: 'duplicate', id: existing }
  try {
    const doc = await req.payload.create({
      collection: input.collection,
      data: toData(req, input),
      draft: true,
      depth: 0,
      overrideAccess: false,
      user: req.user,
    })
    return { status: 'created', id: doc.id }
  } catch (error) {
    // Another call stored the same item between the check and the create
    const raced = isUniqueRefusal(error) ? await findDuplicate(req, input) : null
    if (raced === null) throw error
    return { status: 'duplicate', id: raced }
  }
}

export const submitSuggestionTool = {
  name: 'submitSuggestion',
  description:
    'Suggest an event or a news post. It is stored as an unpublished draft for staff to review, ' +
    'never published. Answers {"status":"created","id"} or, when the same externalId or ' +
    'contentHash is already stored, {"status":"duplicate","id"}.',
  parameters: submitSuggestionShape,
  handler: async (args: Record<string, unknown>, req: PayloadRequest) =>
    toToolAnswer(await submitSuggestion(req, submitSuggestionInput.parse(args))),
}
