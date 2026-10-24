import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  type Account,
  bootPayload,
  createAccount,
  NO_REVALIDATE,
} from '@/platform/payload/testing/inMemoryPayload'
import { createMcpKey, mcpClient } from '@/platform/payload/testing/mcpRequest'

/**
 * The agents' two MCP tools (#336) over real requests to Payload on in-memory SQLite, with the
 * arguments of `intelligence/schemas/` (#344): `submitSuggestion` stores only unpublished
 * suggested drafts and reports duplicates, and `reportItem` writes only to the agent's own run.
 * Every argument is size-capped.
 */

let payload: Payload
let mcp: ReturnType<typeof mcpClient>
let runDocId = 0

const KEY = 'tools-key-for-tests-0123456789abcdef'
const RUN_ID = 'scout-2026-10-24'
const RUN = { pipelineVersion: 1, repoCommit: 'a'.repeat(40), status: 'running' }
const SOURCE = { sourceName: 'Madison Public Library', sourceUrl: 'https://example.com/e/1' }
let next = 0
const suggestion = (extra: Record<string, unknown> = {}) => ({
  collection: 'events',
  title: `Story time ${++next}`,
  bodyMarkdown: '## Story time\n\nBring a **blanket**. [Details](https://example.com/e/1)',
  startsAt: '2026-11-07T16:00:00-06:00',
  endsAt: '2026-11-07T17:00:00-06:00',
  allDay: false,
  venue: 'Pinney Library',
  address: null,
  externalId: `mpl:${next}`,
  contentHash: next.toString(16).padStart(64, 'a'),
  audience: ['families'],
  runId: RUN_ID,
  ...SOURCE,
  ...extra,
})

const call = (name: string, args: Record<string, unknown>) => mcp.tool(name, args, KEY)
const answer = async (name: string, args: Record<string, unknown>) =>
  JSON.parse((await call(name, args)).text) as { status: string; id: number }
const run = () => payload.findByID({ collection: 'agent-runs', id: runDocId, overrideAccess: true })
const createRun = (user: Account, runId: string) =>
  payload.create({
    collection: 'agent-runs',
    data: { ...RUN, runId, agentName: runId, startedAt: '2026-10-24T11:00:00.000Z' },
    user,
    overrideAccess: false,
  })

beforeAll(async () => {
  const booted = await bootPayload()
  payload = booted.payload
  mcp = mcpClient(booted.config)
  const admin = await createAccount(payload, 'admin', 'ana')
  const agent = await createAccount(payload, 'agent', 'scout')
  await createMcpKey(payload, admin, agent.id, KEY)
  runDocId = (await createRun(agent, RUN_ID)).id
}, 60_000)

describe('submitSuggestion', () => {
  it('stores an event as an unpublished suggested draft, with its schedule and source', async () => {
    const result = await answer('submitSuggestion', suggestion())
    expect(result.status).toBe('created')
    const event = await payload.findByID({
      collection: 'events',
      id: result.id,
      draft: true,
      overrideAccess: true,
    })
    expect(event).toMatchObject({
      _status: 'draft',
      moderationStatus: 'suggested',
      date: '2026-11-07T00:00:00.000Z',
      timeStart: '4:00 PM',
      timeEnd: '5:00 PM',
      locationName: 'Pinney Library',
      audience: ['families'],
      ...SOURCE,
    })
    expect(JSON.stringify(event.content)).toContain('blanket')
    const published = await payload.count({
      collection: 'events',
      where: { and: [{ id: { equals: result.id } }, { _status: { equals: 'published' } }] },
      overrideAccess: true,
    })
    expect(published.totalDocs).toBe(0)
  })

  it('stores a post’s Markdown as its content', async () => {
    const post = { collection: 'posts', startsAt: null, endsAt: null, allDay: null, venue: null }
    const result = await answer('submitSuggestion', suggestion(post))
    const stored = await payload.findByID({
      collection: 'posts',
      id: result.id,
      overrideAccess: true,
    })
    expect(stored).toMatchObject({ _status: 'draft', moderationStatus: 'suggested' })
    expect(JSON.stringify(stored.content)).toContain('"tag":"h2"')
  })

  it('answers duplicate, with the stored id, for the same source ID or fingerprint', async () => {
    const first = suggestion()
    const created = await answer('submitSuggestion', first)
    const byId = { ...suggestion({ title: 'Other' }), externalId: first.externalId }
    const byHash = { ...suggestion({ title: 'Other' }), contentHash: first.contentHash }
    expect(await answer('submitSuggestion', byId)).toEqual({ status: 'duplicate', id: created.id })
    expect(await answer('submitSuggestion', byHash)).toEqual({
      status: 'duplicate',
      id: created.id,
    })
  })

  it('refuses an event without a start, and another agent’s run', async () => {
    expect((await call('submitSuggestion', suggestion({ startsAt: null }))).isError).toBe(true)
    const other = await createAccount(payload, 'agent', 'other')
    await createRun(other, 'other-run')
    const refused = await call('submitSuggestion', suggestion({ runId: 'other-run' }))
    expect(refused.isError).toBe(true)
  })
})

describe('reportItem', () => {
  const report = {
    runId: RUN_ID,
    kind: 'needs-review',
    summary: 'Check the date.',
    evidence: [],
    flags: [],
    sourceUrl: 'https://example.com/x',
  }

  it('adds an item to the run and never changes the content it points at', async () => {
    const target = await payload.create({
      collection: 'events',
      data: { title: 'Fall fest', slug: 'fall-fest', date: '2026-11-01', _status: 'published' },
      overrideAccess: true,
      context: NO_REVALIDATE,
    })
    const cancel = {
      ...report,
      kind: 'cancel',
      targetCollection: 'events',
      targetId: target.id,
      summary: 'The city calendar says Fall fest is cancelled.',
      evidence: [
        {
          url: 'https://example.com/fall-fest',
          says: 'Cancelled due to weather',
          retrievedAt: '2026-10-24T10:00:00Z',
        },
      ],
      flags: ['cancelled'],
    }
    expect(await answer('reportItem', cancel)).toMatchObject({ status: 'reported' })
    const after = await payload.findByID({
      collection: 'events',
      id: target.id,
      overrideAccess: true,
    })
    expect(after).toEqual(target)
    expect((await run()).reviewItems?.at(-1)).toMatchObject({
      kind: 'cancel',
      targetCollection: 'events',
      targetId: target.id,
      flags: ['cancelled'],
      evidence: [expect.objectContaining({ says: 'Cancelled due to weather' })],
    })
  })

  it('needs the collection with a target id, and a target for a cancellation', async () => {
    expect((await call('reportItem', { ...report, targetId: 3 })).isError).toBe(true)
    expect((await call('reportItem', { ...report, kind: 'cancel' })).isError).toBe(true)
  })

  it('can’t be rewritten or removed by the agent updating its run', async () => {
    const before = (await run()).reviewItems?.length ?? 0
    expect(before).toBeGreaterThan(0)
    await call('updateAgentRuns', { id: runDocId, reviewItems: [], status: 'succeeded' })
    const after = await run()
    expect(after.status).toBe('succeeded')
    expect(after.reviewItems?.length).toBe(before)
  })
})

describe('every argument', () => {
  const tooLong = (n: number) => 'x'.repeat(n + 1)
  const evidenceItem = { url: 'https://e.com/a', says: 'Said', retrievedAt: '2026-10-24T10:00:00Z' }
  const report = {
    runId: RUN_ID,
    kind: 'needs-review',
    summary: 'Check',
    evidence: [],
    flags: [],
    sourceUrl: 'https://e.com',
  }

  it.each([
    ['title', tooLong(120)],
    ['bodyMarkdown', tooLong(3_000)],
    ['venue', tooLong(200)],
    ['address', tooLong(300)],
    ['sourceName', tooLong(200)],
    ['sourceUrl', `https://example.com/${tooLong(2_048)}`],
    ['externalId', `mpl:${tooLong(200)}`],
    ['externalId', 'no-prefix'],
    ['contentHash', 'f'.repeat(65)],
    ['runId', tooLong(100)],
    ['audience', ['families', 'families']],
  ])(
    'submitSuggestion refuses an oversized or invalid %s and stores nothing',
    async (name, value) => {
      const before = await payload.count({ collection: 'events', overrideAccess: true })
      const result = await call('submitSuggestion', suggestion({ [name]: value }))
      expect(result.isError).toBe(true)
      expect(await payload.count({ collection: 'events', overrideAccess: true })).toEqual(before)
    },
  )

  it.each([
    ['summary', tooLong(1_000)],
    ['externalId', `mpl:${tooLong(200)}`],
    ['evidence', Array.from({ length: 6 }, () => evidenceItem)],
    ['evidence', [{ ...evidenceItem, says: tooLong(500) }]],
    ['flags', ['not-a-flag']],
    ['flags', ['past', 'past']],
    ['sourceUrl', 'not a link'],
  ])('reportItem refuses an oversized or invalid %s', async (name, value) => {
    const before = (await run()).reviewItems?.length
    const result = await call('reportItem', { ...report, [name]: value })
    expect(result.isError).toBe(true)
    expect((await run()).reviewItems?.length).toBe(before)
  })
})
