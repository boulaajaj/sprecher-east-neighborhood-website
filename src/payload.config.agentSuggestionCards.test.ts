import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { bootPayload, createAccount } from '@/platform/payload/testing/inMemoryPayload'
import { createMcpKey, mcpClient } from '@/platform/payload/testing/mcpRequest'

/**
 * What a suggestion's card shows (#363), over real MCP requests to Payload on in-memory SQLite:
 * `submitSuggestion` stores the summary as the card text, links the categories from the shared
 * tree by slug, refuses a slug that isn't in it, and gives the draft the first category's default
 * image, or the nearest one up its parents, or the next category's.
 */

let payload: Payload
let mcp: ReturnType<typeof mcpClient>
const ids: Record<string, number> = {}

const KEY = 'cards-key-for-tests-0123456789abcdef'
const RUN_ID = 'cards-2026-10-25'
// A 1×1 PNG, enough for an upload with image sizes
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const SUMMARY = 'Stories and songs for little ones at the library.'
let next = 0
const suggestion = (extra: Record<string, unknown> = {}) => ({
  collection: 'events',
  title: `Story time ${++next}`,
  bodyMarkdown: 'Bring a blanket.',
  summary: SUMMARY,
  categories: ['story-time'],
  startsAt: '2026-11-07T16:00:00-06:00',
  sourceName: 'Madison Public Library',
  sourceUrl: 'https://example.com/e/1',
  externalId: `mpl:card-${next}`,
  contentHash: next.toString(16).padStart(64, 'c'),
  audience: ['families'],
  runId: RUN_ID,
  ...extra,
})
const submit = async (args: Record<string, unknown>) => mcp.tool('submitSuggestion', args, KEY)
const created = async (args: Record<string, unknown>) =>
  (JSON.parse((await submit(args)).text) as { id: number }).id
const storedEvent = (id: number) =>
  payload.findByID({ collection: 'events', id, depth: 0, draft: true, overrideAccess: true })
const storedPost = (id: number) =>
  payload.findByID({ collection: 'posts', id, depth: 0, draft: true, overrideAccess: true })

beforeAll(async () => {
  const booted = await bootPayload()
  payload = booted.payload
  mcp = mcpClient(booted.config)
  const admin = await createAccount(payload, 'admin', 'ana')
  const agent = await createAccount(payload, 'agent', 'scout')
  await createMcpKey(payload, admin, agent.id, KEY)
  await payload.create({
    collection: 'agent-runs',
    data: {
      runId: RUN_ID,
      agentName: RUN_ID,
      pipelineVersion: 1,
      repoCommit: 'a'.repeat(40),
      status: 'running',
      startedAt: '2026-10-25T11:00:00.000Z',
    },
    user: agent,
    overrideAccess: false,
  })
  for (const name of ['library-photo', 'parks-photo']) {
    const media = await payload.create({
      collection: 'media',
      data: { alt: name, license: 'own' },
      file: { data: PIXEL, mimetype: 'image/png', name: `${name}.png`, size: PIXEL.length },
    })
    ids[name] = media.id
  }
  const category = async (slug: string, parent?: number, defaultImage?: number) => {
    ids[slug] = (
      await payload.create({
        collection: 'categories',
        data: { title: slug, slug, parent, defaultImage },
      })
    ).id
  }
  await category('library', undefined, ids['library-photo'])
  await category('story-time', ids.library) // no image of its own: its parent's is used
  await category('parks', undefined, ids['parks-photo'])
  await category('volunteer') // no image anywhere up its tree
}, 60_000)

describe('a suggested event', () => {
  it('gets the summary as its card text, its categories, and the parent’s image', async () => {
    const event = await storedEvent(await created(suggestion()))
    expect(event.description).toBe(SUMMARY)
    expect(event.categories).toEqual([ids['story-time']])
    expect(event.heroImage).toBe(ids['library-photo'])
  })

  it('takes the next category’s image, and none when no category has one', async () => {
    const parks = await storedEvent(
      await created(suggestion({ categories: ['volunteer', 'parks'] })),
    )
    expect(parks.categories).toEqual([ids.volunteer, ids.parks])
    expect(parks.heroImage).toBe(ids['parks-photo'])
    const plain = await storedEvent(await created(suggestion({ categories: ['volunteer'] })))
    expect(plain.heroImage ?? null).toBeNull()
  })

  it('is refused for a category that isn’t in the tree, and nothing is stored', async () => {
    const before = await payload.count({ collection: 'events', overrideAccess: true })
    const refused = await submit(suggestion({ categories: ['parks', 'zoo'] }))
    expect(refused.isError).toBe(true)
    expect(refused.text).toContain('zoo')
    const after = await payload.count({ collection: 'events', overrideAccess: true })
    expect(after.totalDocs).toBe(before.totalDocs)
  })
})

describe('a suggested post', () => {
  it('gets the summary and image the post card reads, and the same hero image', async () => {
    const post = { collection: 'posts', startsAt: null, categories: ['story-time', 'parks'] }
    const doc = await storedPost(await created(suggestion(post)))
    expect(doc.categories).toEqual([ids['story-time'], ids.parks])
    expect(doc.meta).toMatchObject({ description: SUMMARY, image: ids['library-photo'] })
    expect(doc.heroImage).toBe(ids['library-photo'])
  })
})
