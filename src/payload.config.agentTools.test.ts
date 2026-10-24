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
 * The agents' two MCP tools (#336) over real requests to Payload on in-memory SQLite:
 * `submitSuggestion` stores only unpublished suggested drafts and reports duplicates, and
 * `reportItem` writes only to the agent's own run. Every argument is size-capped.
 */

let payload: Payload
let agent: Account
let mcp: ReturnType<typeof mcpClient>
let runId = 0

const KEY = 'tools-key-for-tests-0123456789abcdef'
const SOURCE = { sourceName: 'Madison Public Library', sourceUrl: 'https://example.com/e/1' }
let next = 0
const suggestion = (extra: Record<string, unknown> = {}) => ({
  collection: 'events',
  title: `Story time ${++next}`,
  bodyMarkdown: '## Story time\n\nBring a **blanket**. [Details](https://example.com/e/1)',
  startsAt: '2026-11-07T16:00:00-06:00',
  endsAt: '2026-11-07T17:00:00-06:00',
  venue: 'Pinney Library',
  externalId: `mpl-${next}`,
  contentHash: `${next}`.padStart(64, 'a'),
  audience: ['families'],
  runId,
  ...SOURCE,
  ...extra,
})

const call = (name: string, args: Record<string, unknown>) => mcp.tool(name, args, KEY)
const answer = async (name: string, args: Record<string, unknown>) =>
  JSON.parse((await call(name, args)).text) as { status: string; id: number }
const run = () => payload.findByID({ collection: 'agent-runs', id: runId, overrideAccess: true })

beforeAll(async () => {
  const booted = await bootPayload()
  payload = booted.payload
  mcp = mcpClient(booted.config)
  const admin = await createAccount(payload, 'admin', 'ana')
  agent = await createAccount(payload, 'agent', 'scout')
  await createMcpKey(payload, admin, agent.id, KEY)
  const created = await payload.create({
    collection: 'agent-runs',
    data: { agentName: 'Scout', repoCommit: 'abc1234', startedAt: '2026-10-24T11:00:00.000Z' },
    user: agent,
    overrideAccess: false,
  })
  runId = created.id
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
    expect((await run()).counts?.proposed).toBe(1)
  })

  it('stores a post’s Markdown as its content', async () => {
    const result = await answer('submitSuggestion', suggestion({ collection: 'posts' }))
    const post = await payload.findByID({
      collection: 'posts',
      id: result.id,
      overrideAccess: true,
    })
    expect(post).toMatchObject({ _status: 'draft', moderationStatus: 'suggested' })
    expect(JSON.stringify(post.content)).toContain('"tag":"h2"')
  })

  it('answers duplicate, with the stored id, for the same source ID or fingerprint', async () => {
    const first = suggestion()
    const created = await answer('submitSuggestion', first)
    const again = { title: 'Other title', runId }
    expect(
      await answer('submitSuggestion', { ...suggestion(again), externalId: first.externalId }),
    ).toEqual({ status: 'duplicate', id: created.id })
    expect(
      await answer('submitSuggestion', { ...suggestion(again), contentHash: first.contentHash }),
    ).toEqual({ status: 'duplicate', id: created.id })
    expect((await run()).counts?.duplicates).toBe(2)
  })

  it('refuses an event without a start, and another agent’s run', async () => {
    expect((await call('submitSuggestion', suggestion({ startsAt: undefined }))).isError).toBe(true)
    const other = await createAccount(payload, 'agent', 'other')
    const otherRun = await payload.create({
      collection: 'agent-runs',
      data: { agentName: 'Other', repoCommit: 'abc1234', startedAt: '2026-10-24T11:00:00.000Z' },
      user: other,
      overrideAccess: false,
    })
    const refused = await call('submitSuggestion', suggestion({ runId: otherRun.id }))
    expect(refused.isError).toBe(true)
  })
})

describe('reportItem', () => {
  it('adds an item to the run and never changes the content it points at', async () => {
    const target = await payload.create({
      collection: 'events',
      data: { title: 'Fall fest', slug: 'fall-fest', date: '2026-11-01', _status: 'published' },
      overrideAccess: true,
      context: NO_REVALIDATE,
    })
    const report = {
      runId,
      kind: 'cancel',
      targetCollection: 'events',
      targetId: target.id,
      summary: 'The city calendar says Fall fest is cancelled.',
      evidence: ['City calendar entry marked cancelled'],
      flags: ['date-sensitive'],
      sourceUrl: 'https://example.com/fall-fest',
    }
    expect(await answer('reportItem', report)).toMatchObject({ status: 'reported' })
    const after = await payload.findByID({
      collection: 'events',
      id: target.id,
      overrideAccess: true,
    })
    expect(after).toEqual(target)
    expect((await run()).reviewItems?.at(-1)).toMatchObject({
      kind: 'cancel',
      targetId: target.id,
      evidence: report.evidence,
      flags: report.flags,
    })
  })

  it('can’t be rewritten or removed by the agent updating its run', async () => {
    const before = (await run()).reviewItems?.length ?? 0
    expect(before).toBeGreaterThan(0)
    await call('updateAgentRuns', { id: runId, reviewItems: [], status: 'succeeded' })
    const after = await run()
    expect(after.status).toBe('succeeded')
    expect(after.reviewItems?.length).toBe(before)
  })
})

describe('every argument', () => {
  const tooLong = (n: number) => 'x'.repeat(n + 1)
  const report = { runId, kind: 'needs-review', summary: 'Check', sourceUrl: 'https://e.com' }

  it.each([
    ['title', tooLong(200)],
    ['bodyMarkdown', tooLong(20_000)],
    ['venue', tooLong(200)],
    ['address', tooLong(300)],
    ['sourceName', tooLong(200)],
    ['sourceUrl', `https://example.com/${tooLong(2_000)}`],
    ['externalId', tooLong(200)],
    ['contentHash', tooLong(128)],
    ['audience', ['families', 'youth', 'seniors', 'everyone', 'volunteers', 'youth', 'seniors']],
  ])('submitSuggestion refuses an oversized %s and stores nothing', async (name, value) => {
    const before = await payload.count({ collection: 'events', overrideAccess: true })
    const result = await call('submitSuggestion', suggestion({ [name]: value }))
    expect(result.isError).toBe(true)
    expect(await payload.count({ collection: 'events', overrideAccess: true })).toEqual(before)
  })

  it.each([
    ['summary', tooLong(2_000)],
    ['externalId', tooLong(200)],
    ['evidence', Array.from({ length: 21 }, () => 'e')],
    ['evidence', [tooLong(1_000)]],
    ['flags', Array.from({ length: 21 }, () => 'f')],
    ['targetId', 3],
    ['flags', [tooLong(50)]],
    ['sourceUrl', 'not a link'],
  ])('reportItem refuses an oversized or invalid %s', async (name, value) => {
    const before = (await run()).reviewItems?.length
    const result = await call('reportItem', { ...report, runId, [name]: value })
    expect(result.isError).toBe(true)
    expect((await run()).reviewItems?.length).toBe(before)
  })
})
