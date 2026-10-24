import type { PayloadRequest, Where } from 'payload'
import { vi } from 'vitest'

// For the cms/ tests: a Payload request whose Local API keeps one collection in memory. It
// understands only the queries this module makes (equals, not_equals, exists, less_than,
// greater_than_equal, in, `and` and `or`), and records every email instead of sending it.

type Doc = Record<string, unknown> & { id: number }
type Condition = {
  equals?: unknown
  not_equals?: unknown
  exists?: boolean
  less_than?: string
  greater_than_equal?: string
  in?: unknown[]
}

function matchesCondition(field: unknown, condition: Condition): boolean {
  if ('equals' in condition) return field === condition.equals
  if ('not_equals' in condition) return field !== condition.not_equals
  if ('exists' in condition) return (field !== null && field !== undefined) === condition.exists
  if (condition.in) return condition.in.includes(field)
  if (condition.less_than !== undefined) {
    return typeof field === 'string' && Date.parse(field) < Date.parse(condition.less_than)
  }
  if (condition.greater_than_equal !== undefined) {
    return (
      typeof field === 'string' && Date.parse(field) >= Date.parse(condition.greater_than_equal)
    )
  }
  throw new Error('fake payload: unsupported condition')
}

function matches(doc: Doc, where: Where | undefined): boolean {
  if (!where) return true
  return Object.entries(where).every(([key, value]) => {
    if (key === 'and') return (value as Where[]).every((w) => matches(doc, w))
    if (key === 'or') return (value as Where[]).some((w) => matches(doc, w))
    return matchesCondition(doc[key] ?? null, value as Condition)
  })
}

type Args = {
  collection?: string
  where?: Where
  id?: number | string
  data?: Record<string, unknown>
}

/**
 * A fake request: `docs` is the collection, `sent` every email, `req` what the code receives.
 * `form` is the one form: what `findByID` answers, and the `forms` collection.
 */
export function fakeSubmissions(docs: Doc[] = [], form: Record<string, unknown> | null = null) {
  const sent: Array<Record<string, unknown>> = []
  const payload = {
    find: vi.fn(async ({ collection, where }: Args) => ({
      docs:
        collection === 'forms'
          ? form
            ? [form]
            : []
          : docs.filter((doc) => matches(doc, where)).map((doc) => ({ ...doc })),
    })),
    findByID: vi.fn(async () => form),
    update: vi.fn(async ({ where, data }: Args) => {
      const changed = docs.filter((doc) => matches(doc, where))
      for (const doc of changed) Object.assign(doc, data)
      return { docs: changed.map((doc) => ({ ...doc })) }
    }),
    count: vi.fn(async ({ where }: Args) => ({
      totalDocs: docs.filter((doc) => matches(doc, where)).length,
    })),
    db: {
      // One statement in the real adapter: the conditions are checked as the rows are deleted
      deleteMany: vi.fn(async ({ where }: Args) => {
        for (const doc of docs.filter((d) => matches(d, where))) docs.splice(docs.indexOf(doc), 1)
      }),
      updateOne: vi.fn(async ({ id, data }: Args) => {
        const doc = docs.find((d) => d.id === id)
        if (doc) Object.assign(doc, data)
        return doc ? { ...doc } : null
      }),
    },
    delete: vi.fn(async ({ where }: Args) => {
      const gone = docs.filter((doc) => matches(doc, where))
      for (const doc of gone) docs.splice(docs.indexOf(doc), 1)
      return { docs: gone }
    }),
    sendEmail: vi.fn(async (email: Record<string, unknown>) => {
      sent.push(email)
    }),
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  }
  const req = { payload, context: {} } as unknown as PayloadRequest
  return { docs, sent, payload, req }
}
