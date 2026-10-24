import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import {
  RETENTION_SCHEDULE,
  releaseStuckJobs,
  STUCK_AFTER_MS,
  withoutPersonalData,
} from './retentionJobs'

describe('withoutPersonalData (#274)', () => {
  it('passes the result through', async () => {
    expect(await withoutPersonalData('task', async () => 3)).toBe(3)
  })

  it('keeps only the task, the error name and its code', async () => {
    const failure = Object.assign(new Error('params: ana@example.com'), {
      cause: { code: 'SQLITE_BUSY' },
    })
    await expect(
      withoutPersonalData('deleteX', async () => {
        throw failure
      }),
    ).rejects.toThrow(/^Retention task deleteX failed \(Error SQLITE_BUSY\)$/)
  })

  it('ignores a code that isn’t a plain constant', async () => {
    await expect(
      withoutPersonalData('deleteX', async () => {
        throw Object.assign(new TypeError('x'), { code: 'ana@example.com' })
      }),
    ).rejects.toThrow(/^Retention task deleteX failed \(TypeError\)$/)
  })
})

describe('releaseStuckJobs (#274)', () => {
  const NOW = Date.parse('2026-10-24T12:00:00.000Z')

  const run = async (stuck: number) => {
    const db = {
      count: vi.fn(async () => ({ totalDocs: stuck })),
      updateMany: vi.fn(async () => []),
    }
    const warn = vi.fn()
    const req = { payload: { db, logger: { warn } } } as unknown as PayloadRequest
    const defaultBeforeSchedule = vi.fn(async () => ({ shouldSchedule: true }))
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    const result = await releaseStuckJobs({
      defaultBeforeSchedule,
      jobStats: {} as never,
      queueable: { taskConfig: { slug: 'deleteX' } } as never,
      req,
    })
    vi.useRealTimers()
    return { db, warn, defaultBeforeSchedule, result }
  }

  it('is the retention schedule’s check', () => {
    expect(RETENTION_SCHEDULE[0]?.hooks?.beforeSchedule).toBe(releaseStuckJobs)
  })

  it('queues again a job processing for over an hour, says so, then lets Payload decide', async () => {
    const { db, warn, defaultBeforeSchedule, result } = await run(1)

    expect(db.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'payload-jobs',
        data: { processing: false },
        where: {
          and: [
            { queue: { equals: 'retention' } },
            { taskSlug: { equals: 'deleteX' } },
            { processing: { equals: true } },
            { completedAt: { exists: false } },
            { updatedAt: { less_than: new Date(NOW - STUCK_AFTER_MS).toISOString() } },
          ],
        },
      }),
    )
    expect(warn).toHaveBeenCalledWith(
      'Retention: 1 deleteX job(s) were stuck in processing; queued again',
    )
    expect(defaultBeforeSchedule).toHaveBeenCalled()
    expect(result).toEqual({ shouldSchedule: true })
  })

  it('changes nothing when no job is stuck', async () => {
    const { db, warn, defaultBeforeSchedule } = await run(0)
    expect(db.updateMany).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
    expect(defaultBeforeSchedule).toHaveBeenCalled()
  })
})
