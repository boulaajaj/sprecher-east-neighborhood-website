import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite'
import { sql } from '@payloadcms/db-sqlite'
import { createLocalReq, type Payload } from 'payload'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { down, up } from '@/migrations/20261024_194426_agent_mcp_access'
import { bootPayload, createAccount } from '@/platform/payload/testing/inMemoryPayload'
import { createMcpKey } from '@/platform/payload/testing/mcpRequest'

/**
 * The agent access migration (#336) rolls back on SQLite with foreign keys enforced, even when
 * edit locks and preferences point at the tables it drops, and applies again afterwards.
 * Each step runs in a transaction, as `payload migrate` runs it.
 */

let payload: Payload
// A file, not memory: each transaction below needs the same database (see `bootPayload`)
const folder = mkdtempSync(path.join(tmpdir(), 'agent-migration-'))
type Db = { run: (query: ReturnType<typeof sql>) => Promise<unknown> }
type Drizzle = Db & { transaction: <T>(fn: (tx: Db) => Promise<T>) => Promise<T> }

const drizzle = () => payload.db.drizzle as unknown as Drizzle
const tables = async (): Promise<string[]> => {
  const result = (await drizzle().run(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND (name LIKE 'agent_%' OR name = 'payload_mcp_api_keys')`,
  )) as { rows: { name: string }[] }
  return result.rows.map((row) => row.name).sort()
}
const inTransaction = async (step: typeof up | typeof down) => {
  const req = await createLocalReq({}, payload)
  await drizzle().transaction((tx) =>
    step({ db: tx, payload, req } as unknown as MigrateUpArgs & MigrateDownArgs),
  )
}

beforeAll(async () => {
  ;({ payload } = await bootPayload(`file:${path.join(folder, 'test.db')}`))
  await drizzle().run(sql`PRAGMA foreign_keys = ON`)
  const admin = await createAccount(payload, 'admin', 'ana')
  const agent = await createAccount(payload, 'agent', 'scout')
  const key = await createMcpKey(payload, admin, agent.id, 'migration-key-0123456789abcdef')
  const run = await payload.create({
    collection: 'agent-runs',
    data: {
      runId: 'scout-1',
      agentName: 'Scout',
      pipelineVersion: 1,
      repoCommit: 'a'.repeat(40),
      status: 'running',
      startedAt: '2026-10-24T11:00:00.000Z',
    },
    user: agent,
    overrideAccess: false,
  })
  const item = await payload.create({
    collection: 'agent-review-items',
    data: { run: run.id, kind: 'needs-review', summary: 'Check', sourceUrl: 'https://e.com' },
    user: agent,
    overrideAccess: false,
  })
  // An editor's edit locks on the run and on the item, and preferences saved for the key
  for (const document of [
    { relationTo: 'agent-runs' as const, value: run.id },
    { relationTo: 'agent-review-items' as const, value: item.id },
  ]) {
    await payload.db.create({
      collection: 'payload-locked-documents',
      data: { document, user: { relationTo: 'users', value: admin.id } },
    })
  }
  // Written through the database adapter: Payload stores these for whoever is signed in
  await payload.db.create({
    collection: 'payload-preferences',
    data: { key: 'test', value: {}, user: { relationTo: 'payload-mcp-api-keys', value: key.id } },
  })
}, 60_000)

afterAll(async () => {
  await payload.destroy()
  rmSync(folder, { recursive: true, force: true })
})

describe('the agent access migration', () => {
  it('rolls back with references in place, then applies again', async () => {
    const created = await tables()
    expect(created).toContain('agent_runs')
    const locks = async () =>
      (
        (await drizzle().run(sql`SELECT count(*) AS n FROM payload_locked_documents`)) as {
          rows: { n: number }[]
        }
      ).rows[0].n
    expect(await locks()).toBe(2)
    await inTransaction(down)
    expect(await tables()).toEqual([])
    expect(await locks()).toBe(0)
    await inTransaction(up)
    expect(await tables()).toEqual(created)
  })
})
