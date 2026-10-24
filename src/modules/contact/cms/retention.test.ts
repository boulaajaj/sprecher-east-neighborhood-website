import type { TaskHandler } from 'payload'
import { describe, expect, it } from 'vitest'

import { fakeSubmissions } from '../testing/fakeSubmissions'
import {
  CONTACT_RETENTION_TASK,
  contactRetentionTask,
  deleteExpiredSubmissions,
  keepSendersWithMessages,
} from './retention'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const NOW = Date.parse('2026-10-24T12:00:00.000Z')
const iso = (ms: number) => new Date(ms).toISOString()
/** 12 calendar months before NOW. */
const YEAR_AGO = Date.parse('2025-10-24T12:00:00.000Z')

const message = (id: number, createdAt: number, more: Record<string, unknown> = {}) => ({
  id,
  createdAt: iso(createdAt),
  senderEmail: 'ana@example.com',
  emailConfirmed: true,
  retentionHold: false,
  ...more,
})

describe('deleteExpiredSubmissions (#274)', () => {
  it('deletes unconfirmed messages after 48 hours and confirmed ones 12 months after the last', async () => {
    const { docs, req } = fakeSubmissions([
      message(1, NOW - 49 * HOUR, { emailConfirmed: false }),
      message(2, NOW - 47 * HOUR, { emailConfirmed: false }),
      message(3, YEAR_AGO - DAY, { senderEmail: 'ben@example.com' }),
      message(4, YEAR_AGO - DAY),
      // Ana wrote again this month, so her old message stays
      message(5, NOW - 10 * DAY),
      message(6, YEAR_AGO - DAY, { senderEmail: null, emailConfirmed: false }),
      message(7, YEAR_AGO - DAY, { senderEmail: 'cy@example.com', retentionHold: true }),
      message(8, NOW - 72 * HOUR, { emailConfirmed: false, retentionHold: true }),
    ])

    expect(await deleteExpiredSubmissions(req, NOW)).toBe(3)
    expect(docs.map((doc) => doc.id)).toEqual([2, 4, 5, 7, 8])
  })

  it('deletes nothing when nothing is old enough, without looking up recent senders', async () => {
    const { docs, payload, req } = fakeSubmissions([message(1, NOW - HOUR)])
    expect(await deleteExpiredSubmissions(req, NOW)).toBe(0)
    expect(docs).toHaveLength(1)
    expect(payload.find).toHaveBeenCalledOnce()
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it('reads with access bypassed, and only the fields the rules need', async () => {
    const { payload, req } = fakeSubmissions()
    await deleteExpiredSubmissions(req, NOW)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'form-submissions',
        overrideAccess: true,
        select: { createdAt: true, senderEmail: true, emailConfirmed: true, retentionHold: true },
      }),
    )
  })
})

describe('keepSendersWithMessages', () => {
  it('keeps the addresses that still have a stored message', async () => {
    const { req } = fakeSubmissions([message(1, NOW), message(2, NOW, { senderEmail: null })])
    const kept = await keepSendersWithMessages(['ana@example.com', 'gone@example.com'], req)
    expect([...kept]).toEqual(['ana@example.com'])
  })

  it('asks nothing for no addresses', async () => {
    const { payload, req } = fakeSubmissions()
    expect((await keepSendersWithMessages([], req)).size).toBe(0)
    expect(payload.find).not.toHaveBeenCalled()
  })
})

describe('contactRetentionTask', () => {
  it('runs every hour in the retention queue and logs a count only', async () => {
    expect(contactRetentionTask.slug).toBe(CONTACT_RETENTION_TASK)
    expect(contactRetentionTask.schedule).toEqual([{ cron: '0 * * * *', queue: 'retention' }])

    const { payload, req } = fakeSubmissions([message(1, 0, { emailConfirmed: false })])
    const handler = contactRetentionTask.handler as TaskHandler<{ input: object; output: object }>
    expect(await handler({ req } as Parameters<typeof handler>[0])).toEqual({
      output: { deleted: 1 },
    })
    expect(payload.logger.info).toHaveBeenCalledWith('Retention: deleted 1 contact messages')
  })
})
