import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { User } from '@/payload-types'
import { countSuggestions } from '@/platform/payload/reviewQueue'

/**
 * The review queue on events and posts (#123), through the Local API on Payload booted on an
 * in-memory SQLite database: what isn't written by staff waits as a suggested draft with its
 * source, the same source ID or content fingerprint can't be stored twice, and publishing a
 * suggestion approves it.
 */

let payload: Payload
let editor: User & { collection: 'users' }
let resident: User & { collection: 'users' }

const source = { sourceName: 'City of Madison', sourceUrl: 'https://www.cityofmadison.com/e/1' }
// Publishing refreshes cached pages, which needs Next.js
const NO_REVALIDATE = { disableRevalidate: true }
let next = 0
const event = (extra: Record<string, unknown> = {}) => ({
  title: `Park cleanup ${++next}`,
  slug: `park-cleanup-${next}`,
  date: '2026-11-07T00:00:00.000Z',
  ...extra,
})

// Our own server code: the Local API with no user, as the seed writes
const serverCreate = (data: Record<string, unknown>) =>
  payload.create({ collection: 'events', data: event(data), overrideAccess: true })

const account = async (role: User['role']) => {
  const user = await payload.create({
    collection: 'users',
    data: { email: `${role}@example.com`, password: `${role}-password-for-tests`, role },
    disableVerificationEmail: true,
    overrideAccess: true,
  })
  return { ...user, collection: 'users' as const }
}

beforeAll(async () => {
  vi.stubEnv('DATABASE_URI', 'file::memory:')
  vi.stubEnv('PAYLOAD_SECRET', 'review-queue-test-secret-0123456789')
  vi.stubEnv('SMTP_HOST', '')
  const { getPayload } = await import('payload')
  const config = await (await import('@payload-config')).default
  payload = await getPayload({ config })
  editor = await account('editor')
  resident = await account('resident')
}, 60_000)

describe('a create that doesn’t come from staff', () => {
  it('is refused to a resident by collection access', async () => {
    await expect(
      payload.create({
        collection: 'events',
        data: event(source),
        user: resident,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  // Access is skipped here so the hook can be seen on its own: the next layer gives agents create
  it('is held as a suggested draft even when it asks to publish', async () => {
    const created = await payload.create({
      collection: 'events',
      data: event({ ...source, _status: 'published', moderationStatus: 'approved' }),
      user: resident,
      overrideAccess: true,
    })
    expect(created).toMatchObject({ _status: 'draft', moderationStatus: 'suggested', ...source })
  })

  it('must name its source', async () => {
    await expect(
      payload.create({
        collection: 'events',
        data: event({ sourceName: 'Somewhere' }),
        user: resident,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/sourceUrl|Source link/)
  })
})

describe('staff', () => {
  it('publish their own content without a review status', async () => {
    const created = await payload.create({
      collection: 'events',
      data: event({ _status: 'published' }),
      user: editor,
      overrideAccess: false,
      context: NO_REVALIDATE,
    })
    expect(created).toMatchObject({ _status: 'published' })
    expect(created.moderationStatus ?? null).toBeNull()
  })

  it('approve a suggestion by publishing it', async () => {
    const suggestion = await payload.create({
      collection: 'events',
      data: event(source),
      user: resident,
      overrideAccess: true,
    })
    const published = await payload.update({
      collection: 'events',
      id: suggestion.id,
      data: { _status: 'published' },
      user: editor,
      overrideAccess: false,
      context: NO_REVALIDATE,
    })
    expect(published).toMatchObject({ _status: 'published', moderationStatus: 'approved' })
  })
})

describe('de-duplication', () => {
  it('refuses a second event with the same source ID', async () => {
    await serverCreate({ externalId: 'city-42' })
    await expect(serverCreate({ externalId: 'city-42' })).rejects.toThrow()
    const { totalDocs } = await payload.count({
      collection: 'events',
      where: { externalId: { equals: 'city-42' } },
      overrideAccess: true,
    })
    expect(totalDocs).toBe(1)
  })

  it('refuses a second event with the same content fingerprint', async () => {
    const contentHash = 'a'.repeat(64)
    await serverCreate({ contentHash })
    await expect(serverCreate({ contentHash })).rejects.toThrow()
  })

  it('lets any number of items leave them blank', async () => {
    await serverCreate({ externalId: '', contentHash: ' ' })
    const second = await serverCreate({ externalId: '', contentHash: '' })
    expect(second).toMatchObject({ externalId: null, contentHash: null })
  })
})

// The admin list's "waiting for review" count reads each item's latest draft: Save Draft stores a
// status change in the version history only, not on the collection row
describe('the count of suggestions waiting for review', () => {
  const waiting = () => countSuggestions(payload, 'events', editor)
  const saveDraft = (id: number, data: Record<string, unknown>) =>
    payload.update({
      collection: 'events',
      id,
      data,
      draft: true,
      user: editor,
      overrideAccess: false,
      context: NO_REVALIDATE,
    })

  it('drops a suggestion staff reject with Save Draft', async () => {
    const suggestion = await payload.create({
      collection: 'events',
      data: event(source),
      user: resident,
      overrideAccess: true,
    })
    const before = await waiting()
    await saveDraft(suggestion.id, { moderationStatus: 'rejected' })
    expect(await waiting()).toBe(before - 1)
  })

  it('counts a published item marked suggested again in a draft', async () => {
    const published = await payload.create({
      collection: 'events',
      data: event({ _status: 'published' }),
      user: editor,
      overrideAccess: false,
      context: NO_REVALIDATE,
    })
    const before = await waiting()
    await saveDraft(published.id, { moderationStatus: 'suggested' })
    expect(await waiting()).toBe(before + 1)
  })
})
