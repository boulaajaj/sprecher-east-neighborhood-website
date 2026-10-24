import type { PayloadRequest, Where } from 'payload'
import { vi } from 'vitest'

// For the cms/ tests: a Payload request whose Local API keeps the `email-confirmations`
// collection in memory. It understands only the queries this module makes (equals, exists,
// less_than, in and `and`), and records every email instead of sending it.

type Doc = Record<string, unknown> & { id: number }
type Condition = { equals?: unknown; exists?: boolean; less_than?: string; in?: unknown[] }

function matches(doc: Doc, where: Where | undefined): boolean {
  if (!where) return true
  return Object.entries(where).every(([key, value]) => {
    if (key === 'and') return (value as Where[]).every((w) => matches(doc, w))
    const condition = value as Condition
    const field = doc[key] ?? null
    if ('equals' in condition) return field === condition.equals
    if ('exists' in condition) return (field !== null) === condition.exists
    if (condition.in) return condition.in.includes(field)
    if (condition.less_than !== undefined) {
      return typeof field === 'string' && field < condition.less_than
    }
    throw new Error(`fake payload: unsupported condition on ${key}`)
  })
}

type Args = { where?: Where; id?: number; data?: Record<string, unknown> }

/** A fake request: `docs` is the collection, `sent` every email, `req` what the code receives. */
export function fakeRequest({ ip = '203.0.113.7' as string | null } = {}) {
  const docs: Doc[] = []
  const sent: Array<{ to: string; subject: string; text: string; html: string }> = []
  let nextId = 1

  const selected = ({ where, id }: Args) =>
    docs.filter((doc) => (id === undefined || doc.id === id) && matches(doc, where))

  const payload = {
    find: vi.fn(async (args: Args) => ({ docs: selected(args).map((doc) => ({ ...doc })) })),
    create: vi.fn(async ({ data }: Args) => {
      if (docs.some((doc) => doc.email === data?.email)) throw new Error('unique email')
      const doc = { id: nextId++, confirmedAt: null, ...data }
      docs.push(doc)
      return { ...doc }
    }),
    update: vi.fn(async (args: Args) => {
      const changed = selected(args)
      for (const doc of changed) Object.assign(doc, args.data)
      const copies = changed.map((doc) => ({ ...doc }))
      return args.id === undefined ? { docs: copies } : copies[0]
    }),
    delete: vi.fn(async (args: Args) => {
      const gone = selected(args)
      for (const doc of gone) docs.splice(docs.indexOf(doc), 1)
      return { docs: gone }
    }),
    count: vi.fn(async (args: Args) => ({ totalDocs: selected(args).length })),
    // The adapter: like SQL's UPDATE … WHERE and DELETE … WHERE, the condition and the write
    // happen in one step, so of two calls at once only the first can match
    db: {
      deleteMany: vi.fn(async (args: Args) => {
        for (const doc of selected(args)) docs.splice(docs.indexOf(doc), 1)
      }),
      updateOne: vi.fn(async (args: Args) => {
        const doc = selected(args)[0]
        if (!doc) return null
        Object.assign(doc, args.data)
        return { ...doc }
      }),
    },
    sendEmail: vi.fn(async (email: (typeof sent)[number]) => {
      sent.push(email)
    }),
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  }

  const req = {
    payload,
    headers: new Headers(ip ? { 'x-forwarded-for': ip } : {}),
  } as unknown as PayloadRequest

  return { docs, sent, payload, req }
}
