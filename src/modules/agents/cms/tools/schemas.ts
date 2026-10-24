import { z } from 'zod'

import { AUDIENCES, type Audience } from '@/platform/lib'

import {
  REVIEW_ITEM_KINDS,
  type ReviewItemKind,
  SUGGESTION_CAPS as CAPS,
  SUGGESTION_COLLECTIONS,
} from '../../domain/suggestion'

/**
 * The arguments of the agents' two MCP tools (#336), with a size cap on every one. The MCP server
 * checks them before the handler runs; the handler parses them again for its types.
 */

const text = (max: number) => z.string().trim().min(1).max(max)
const optionalText = (max: number) => z.string().trim().max(max).optional()
const webAddress = z.url({ protocol: /^https?$/ }).max(CAPS.sourceUrl)
const when = z.union([z.iso.date(), z.iso.datetime({ offset: true })])
const values = <T extends string>(options: readonly { value: T }[]) =>
  options.map((option) => option.value) as [T, ...T[]]

export const submitSuggestionShape = {
  collection: z.enum(SUGGESTION_COLLECTIONS).describe('Where it goes: an event or a news post.'),
  title: text(CAPS.title),
  bodyMarkdown: z.string().max(CAPS.bodyMarkdown).describe('The full text, in Markdown.'),
  startsAt: when.optional().describe('Events: a day (YYYY-MM-DD) or a date-time with offset.'),
  endsAt: when.optional(),
  allDay: z.boolean().nullable().optional(),
  venue: optionalText(CAPS.venue),
  address: optionalText(CAPS.address),
  sourceName: text(CAPS.sourceName),
  sourceUrl: webAddress,
  externalId: text(CAPS.externalId).describe('The source’s own ID for the item.'),
  contentHash: text(CAPS.contentHash).describe('A fingerprint of the item’s content.'),
  audience: z
    .array(z.enum(values<Audience>(AUDIENCES)))
    .max(AUDIENCES.length)
    .default([]),
  runId: z.number().int().positive().describe('The id of your current run in agent-runs.'),
}

export const reportItemShape = {
  runId: z.number().int().positive(),
  kind: z.enum(values<ReviewItemKind>(REVIEW_ITEM_KINDS)),
  targetCollection: z.enum(SUGGESTION_COLLECTIONS).optional(),
  targetId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('With targetCollection: ids are per collection.'),
  externalId: optionalText(CAPS.externalId),
  summary: text(CAPS.summary).describe('What an editor should know or do, in a few sentences.'),
  evidence: z.array(text(CAPS.evidence)).max(CAPS.evidenceItems).default([]),
  flags: z.array(text(CAPS.flag)).max(CAPS.flags).default([]),
  sourceUrl: webAddress,
}

export const submitSuggestionInput = z.object(submitSuggestionShape)
export const reportItemInput = z
  .object(reportItemShape)
  .refine((item) => item.targetId === undefined || item.targetCollection !== undefined, {
    message: 'targetCollection is required with targetId',
    path: ['targetCollection'],
  })
export type SubmitSuggestionInput = z.infer<typeof submitSuggestionInput>
export type ReportItemInput = z.infer<typeof reportItemInput>
