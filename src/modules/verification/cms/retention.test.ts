import type { TaskHandler } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { fakeRequest } from '../testing/fakeRequest'
import {
  CONFIRMATION_RETENTION_TASK,
  createConfirmationRetentionTask,
  deleteExpiredConfirmations,
} from './retention'

const HOUR = 60 * 60 * 1000
const NOW = Date.parse('2026-10-24T12:00:00.000Z')
const iso = (ms: number) => new Date(ms).toISOString()
/** 12 calendar months before NOW. */
const YEAR_AGO = Date.parse('2025-10-24T12:00:00.000Z')

/** A keeper that still needs these addresses. */
const keeping = (...emails: string[]) => vi.fn(async () => new Set(emails))

describe('deleteExpiredConfirmations (#274)', () => {
  it('deletes an unconfirmed address 48 hours after its last link, not before', async () => {
    const { docs, req } = fakeRequest()
    docs.push(
      {
        id: 1,
        email: 'stale@example.com',
        confirmedAt: null,
        lastSentAt: iso(NOW - 48 * HOUR - 1),
      },
      { id: 2, email: 'fresh@example.com', confirmedAt: null, lastSentAt: iso(NOW - 48 * HOUR) },
    )

    expect(await deleteExpiredConfirmations(req, [], NOW)).toEqual({ unconfirmed: 1, confirmed: 0 })
    expect(docs.map((doc) => doc.email)).toEqual(['fresh@example.com'])
  })

  it('deletes a confirmed address 12 months after it was confirmed when nothing still needs it', async () => {
    const { docs, req } = fakeRequest()
    docs.push(
      {
        id: 1,
        email: 'old@example.com',
        confirmedAt: iso(YEAR_AGO - 1),
        lastSentAt: iso(YEAR_AGO),
      },
      { id: 2, email: 'recent@example.com', confirmedAt: iso(YEAR_AGO), lastSentAt: iso(YEAR_AGO) },
    )

    expect(await deleteExpiredConfirmations(req, [keeping()], NOW)).toEqual({
      unconfirmed: 0,
      confirmed: 1,
    })
    expect(docs.map((doc) => doc.email)).toEqual(['recent@example.com'])
  })

  it('keeps a confirmed address any keeper still needs (a kept message, an account)', async () => {
    const { docs, req } = fakeRequest()
    const old = iso(YEAR_AGO - HOUR)
    docs.push(
      { id: 1, email: 'writes@example.com', confirmedAt: old, lastSentAt: old },
      { id: 2, email: 'resident@example.com', confirmedAt: old, lastSentAt: old },
      { id: 3, email: 'gone@example.com', confirmedAt: old, lastSentAt: old },
    )
    const messages = keeping('writes@example.com')
    const accounts = keeping('resident@example.com')

    await deleteExpiredConfirmations(req, [messages, accounts], NOW)

    expect(docs.map((doc) => doc.email)).toEqual(['writes@example.com', 'resident@example.com'])
    const asked = ['writes@example.com', 'resident@example.com', 'gone@example.com']
    expect(messages).toHaveBeenCalledWith(asked, req)
    expect(accounts).toHaveBeenCalledWith(asked, req)
  })

  it('deletes nothing confirmed when a keeper fails, so the next run tries again', async () => {
    const { docs, req } = fakeRequest()
    docs.push({ id: 1, email: 'old@example.com', confirmedAt: iso(YEAR_AGO - 1), lastSentAt: null })
    const failing = vi.fn(async (): Promise<Set<string>> => {
      throw new Error('database busy')
    })

    await expect(deleteExpiredConfirmations(req, [failing], NOW)).rejects.toThrow('database busy')
    expect(docs).toHaveLength(1)
  })

  it('asks no keeper when no confirmed address is old enough', async () => {
    const { req } = fakeRequest()
    const keeper = keeping()
    await deleteExpiredConfirmations(req, [keeper], NOW)
    expect(keeper).not.toHaveBeenCalled()
  })
})

describe('createConfirmationRetentionTask', () => {
  it('runs every hour in the retention queue and logs counts, never an address', async () => {
    const task = createConfirmationRetentionTask({ keepers: [keeping()] })
    expect(task.slug).toBe(CONFIRMATION_RETENTION_TASK)
    expect(task.schedule).toEqual([{ cron: '0 * * * *', queue: 'retention' }])

    const { docs, payload, req } = fakeRequest()
    docs.push({ id: 1, email: 'old@example.com', confirmedAt: iso(0), lastSentAt: null })
    const handler = task.handler as TaskHandler<{ input: object; output: object }>
    const result = await handler({ req } as Parameters<typeof handler>[0])

    expect(result).toEqual({ output: { unconfirmed: 0, confirmed: 1 } })
    expect(payload.logger.info).toHaveBeenCalledWith(
      'Retention: deleted 0 unconfirmed and 1 confirmed email confirmations',
    )
  })
})
