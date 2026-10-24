import type { SanitizedConfig } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Policy test for the whole data model. It loads the real Payload config (no database) and
 * checks every collection and global, including those added by plugins and by Payload itself,
 * against what visitors and residents may do. A new collection, a plugin default or a missing
 * `access` entry fails here instead of reaching production (#140).
 */

type Operation = 'read' | 'create' | 'update' | 'delete' | 'readVersions' | 'unlock'
type Audience = 'visitor' | 'resident'

const AUDIENCES: Record<Audience, unknown> = {
  visitor: null,
  resident: { id: 7, role: 'resident', collection: 'users' },
}
const PUBLIC = ['visitor', 'resident'] satisfies Audience[]
const RESIDENT_ONLY = ['resident'] satisfies Audience[]

/** Everything visitors and residents may do. Anything missing here must be denied. */
const ALLOWED: Record<string, Partial<Record<Operation, Audience[]>>> = {
  // Content: published documents only (authenticatedOrPublished returns a filter)
  pages: { read: PUBLIC },
  posts: { read: PUBLIC },
  events: { read: PUBLIC },
  faq: { read: PUBLIC },
  resources: { read: PUBLIC },
  // Public reference data
  categories: { read: PUBLIC },
  media: { read: PUBLIC },
  'team-members': { read: PUBLIC },
  search: { read: PUBLIC },
  // Visitors need a form's fields to fill it in, and may send a submission
  forms: { read: PUBLIC },
  'form-submissions': { create: PUBLIC },
  // Payload's own: each user's admin preferences, filtered to their own rows
  'payload-preferences': {
    read: RESIDENT_ONLY,
    create: RESIDENT_ONLY,
    update: RESIDENT_ONLY,
    delete: RESIDENT_ONLY,
  },
  // `email-confirmations` is admin-only: the server writes it with access bypassed (#183)
  // Payload's own edit locks are staff-only (`restrictEditLocks`, #147), so not listed here
  // Payload's own, with no REST or GraphQL endpoints (`endpoints: false`)
  'payload-migrations': {
    read: RESIDENT_ONLY,
    create: RESIDENT_ONLY,
    update: RESIDENT_ONLY,
    delete: RESIDENT_ONLY,
  },
  // Globals
  header: { read: PUBLIC },
  footer: { read: PUBLIC },
}

type AccessFn = (args: unknown) => unknown

/** Runs an access function the way Payload does for this audience and returns its result. */
async function accessResult(access: unknown, audience: Audience, id?: number): Promise<unknown> {
  const user = AUDIENCES[audience]
  // With no access function, Payload lets any signed-in user through (`executeAccess`)
  if (access === undefined) return user !== null
  if (typeof access !== 'function') throw new Error('access is not a function')
  return (access as AccessFn)({
    req: { user, headers: new Headers(), payload: { config: { admin: { user: 'users' } } } },
    id,
  })
}

/** True when the access function lets the audience through (a query filter counts as yes). */
async function allows(access: unknown, audience: Audience, id?: number): Promise<boolean> {
  return (await accessResult(access, audience, id)) !== false
}

let config: SanitizedConfig

beforeAll(async () => {
  config = await (await import('@payload-config')).default
}, 60_000)

describe('collections', () => {
  it('let visitors and residents do only what the policy allows', async () => {
    const problems: string[] = []
    for (const collection of config.collections) {
      // Version history and unlocking only exist where versions and logins do
      const operations: Operation[] = ['read', 'create', 'update', 'delete']
      if (collection.versions) operations.push('readVersions')
      if (collection.auth) operations.push('unlock')
      for (const operation of operations) {
        for (const audience of Object.keys(AUDIENCES) as Audience[]) {
          const expected = ALLOWED[collection.slug]?.[operation]?.includes(audience) ?? false
          const actual = await allows(collection.access[operation], audience, 99)
          if (actual !== expected) {
            problems.push(`${collection.slug}.${operation} for ${audience}: ${actual}`)
          }
        }
      }
    }
    expect(problems).toEqual([])
  })

  it('show visitors and residents only published documents where drafts exist', async () => {
    const withDrafts = config.collections.filter(
      (c) => typeof c.versions === 'object' && c.versions.drafts,
    )
    expect(withDrafts.map((c) => c.slug).sort()).toEqual(
      ['events', 'faq', 'pages', 'posts', 'resources'].sort(),
    )
    for (const collection of withDrafts) {
      for (const audience of ['visitor', 'resident'] as const) {
        expect(await accessResult(collection.access.read, audience)).toEqual({
          _status: { equals: 'published' },
        })
      }
    }
  })

  it('let a resident reach their own user record and nobody else’s', async () => {
    const users = config.collections.find((c) => c.slug === 'users')
    expect(await allows(users?.access.update, 'resident', 7)).toBe(true)
    expect(await allows(users?.access.update, 'resident', 99)).toBe(false)
    expect(await allows(users?.access.read, 'resident', 7)).toBe(true)
  })

  it('let only admins reach email confirmations, which hold typed addresses (#183)', async () => {
    const confirmations = config.collections.find((c) => c.slug === 'email-confirmations')
    const editor = { req: { user: { id: 2, role: 'editor', collection: 'users' } } }
    const admin = { req: { user: { id: 1, role: 'admin', collection: 'users' } } }
    for (const operation of ['read', 'create', 'update', 'delete'] as const) {
      const access = confirmations?.access[operation] as AccessFn
      expect(await access(editor)).toBe(false)
      expect(await access(admin)).toBe(true)
    }
    const hidden = confirmations?.fields.filter((f) => 'hidden' in f && f.hidden)
    expect(hidden?.map((f) => ('name' in f ? f.name : ''))).toContain('tokenHash')
  })

  it('have no collection missing from the policy review', () => {
    const reviewed = new Set([
      ...Object.keys(ALLOWED),
      'users',
      'redirects',
      'email-confirmations',
      'payload-kv',
    ])
    const unreviewed = config.collections
      .map((c) => c.slug)
      .filter((slug) => !reviewed.has(slug) && !slug.startsWith('payload-'))
    expect(unreviewed).toEqual([])
  })
})

describe('globals', () => {
  it('let visitors and residents only read them', async () => {
    const problems: string[] = []
    for (const global of config.globals) {
      const operations: Operation[] = ['read', 'update']
      if (global.versions) operations.push('readVersions')
      for (const operation of operations) {
        for (const audience of Object.keys(AUDIENCES) as Audience[]) {
          const expected = ALLOWED[global.slug]?.[operation]?.includes(audience) ?? false
          const access = (global.access as Record<string, unknown>)[operation]
          const actual = await allows(access, audience)
          if (actual !== expected) problems.push(`${global.slug}.${operation} for ${audience}`)
        }
      }
    }
    expect(problems).toEqual([])
  })
})

describe('jobs', () => {
  it('let only staff queue or cancel jobs, and only admins run them', async () => {
    const access = config.jobs.access ?? {}
    for (const audience of Object.keys(AUDIENCES) as Audience[]) {
      expect(await allows(access.queue, audience)).toBe(false)
      expect(await allows(access.cancel, audience)).toBe(false)
      expect(await allows(access.run, audience)).toBe(false)
    }
    const editor = { req: { user: { id: 2, role: 'editor', collection: 'users' } } }
    const admin = { req: { user: { id: 1, role: 'admin', collection: 'users' } } }
    expect(await (access.queue as AccessFn)(editor)).toBe(true)
    expect(await (access.run as AccessFn)(editor)).toBe(false)
    expect(await (access.run as AccessFn)(admin)).toBe(true)
  })

  it('run only the retention queue in the app, where both retention tasks are scheduled (#274)', () => {
    expect(config.jobs.autoRun).toEqual([{ cron: '*/10 * * * *', queue: 'retention' }])
    const scheduled = (config.jobs.tasks ?? [])
      .filter((task) => task.schedule?.some((schedule) => schedule.queue === 'retention'))
      .map((task) => task.slug)
    expect(scheduled.sort()).toEqual([
      'deleteExpiredContactMessages',
      'deleteExpiredEmailConfirmations',
    ])
  })
})

describe('private fields', () => {
  /** The field's own read rule, or undefined when the field has none. */
  const fieldReadAccess = (collection: string, name: string): unknown => {
    const field = config.collections
      .find((c) => c.slug === collection)
      ?.fields.find((f) => 'name' in f && f.name === name)
    return field && 'access' in field ? field.access?.read : undefined
  }

  it.each([
    ['team-members', 'email'],
    ['forms', 'emails'],
    // Would tell a visitor whether the address they typed is confirmed (#183)
    ['form-submissions', 'senderEmail'],
    ['form-submissions', 'emailConfirmed'],
    // Staff's reasons for keeping a message longer (#274)
    ['form-submissions', 'retentionHold'],
    ['form-submissions', 'retentionHoldReason'],
  ])('%s.%s is hidden from visitors and residents', async (collection, name) => {
    const read = fieldReadAccess(collection, name)
    expect(await allows(read, 'visitor')).toBe(false)
    expect(await allows(read, 'resident')).toBe(false)
  })
})
