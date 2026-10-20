import type { SanitizedConfig } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Policy test for the whole data model. It loads the real Payload config (no database) and
 * checks every collection and global, including those added by plugins and by Payload itself,
 * against what visitors and residents may do. A new collection, a plugin default or a missing
 * `access` entry fails here instead of reaching production (#140).
 */

type Operation = 'read' | 'create' | 'update' | 'delete'
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
  // Payload's own, not configurable: edit locks for the admin screens (#140)
  'payload-locked-documents': {
    read: RESIDENT_ONLY,
    create: RESIDENT_ONLY,
    update: RESIDENT_ONLY,
    delete: RESIDENT_ONLY,
  },
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

/** True when the access function lets the audience through (a query filter counts as yes). */
async function allows(access: unknown, audience: Audience, id?: number): Promise<boolean> {
  if (typeof access !== 'function') throw new Error('access is not a function')
  const result = await (access as AccessFn)({
    req: { user: AUDIENCES[audience], headers: new Headers() },
    id,
  })
  return result !== false
}

let config: SanitizedConfig

beforeAll(async () => {
  config = await (await import('@payload-config')).default
}, 60_000)

describe('collections', () => {
  const operations: Operation[] = ['read', 'create', 'update', 'delete']

  it('let visitors and residents do only what the policy allows', async () => {
    const problems: string[] = []
    for (const collection of config.collections) {
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

  it('let a resident reach their own user record and nobody else’s', async () => {
    const users = config.collections.find((c) => c.slug === 'users')
    expect(await allows(users?.access.update, 'resident', 7)).toBe(true)
    expect(await allows(users?.access.update, 'resident', 99)).toBe(false)
    expect(await allows(users?.access.read, 'resident', 7)).toBe(true)
  })

  it('have no collection missing from the policy review', () => {
    const reviewed = new Set([...Object.keys(ALLOWED), 'users', 'redirects', 'payload-kv'])
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
      for (const operation of ['read', 'update'] as const) {
        for (const audience of Object.keys(AUDIENCES) as Audience[]) {
          const expected = ALLOWED[global.slug]?.[operation]?.includes(audience) ?? false
          const actual = await allows(global.access[operation], audience)
          if (actual !== expected) problems.push(`${global.slug}.${operation} for ${audience}`)
        }
      }
    }
    expect(problems).toEqual([])
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
  ])('%s.%s is hidden from visitors and residents', async (collection, name) => {
    const read = fieldReadAccess(collection, name)
    expect(await allows(read, 'visitor')).toBe(false)
    expect(await allows(read, 'resident')).toBe(false)
  })
})
