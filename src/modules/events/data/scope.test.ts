import { afterEach, describe, expect, it, vi } from 'vitest'

import { inScope } from './scope'

describe('inScope', () => {
  const today = '2026-10-19T00:00:00.000Z'

  it('keeps upcoming events dated today or later', () => {
    expect(inScope('upcoming', today)).toEqual({ date: { greater_than_equal: today } })
  })

  it('keeps past events dated before today', () => {
    expect(inScope('past', today)).toEqual({ date: { less_than: today } })
  })

  describe('with today from the clock in America/Chicago', () => {
    /** SITE_TIMEZONE is read when the module loads, so load a fresh copy. */
    async function todayAt(instant: string) {
      vi.resetModules()
      vi.stubEnv('SITE_TIMEZONE', 'America/Chicago')
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(instant))
      const { startOfToday } = await import('@/platform/lib/timezone')
      return startOfToday()
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    it('still counts Oct 19 as upcoming at 23:59:59 CDT, though it is Oct 20 in UTC', async () => {
      const today = await todayAt('2026-10-20T04:59:59.000Z')
      expect(inScope('upcoming', today)).toEqual({
        date: { greater_than_equal: '2026-10-19T00:00:00.000Z' },
      })
      expect(inScope('past', today)).toEqual({ date: { less_than: '2026-10-19T00:00:00.000Z' } })
    })

    it('moves Oct 19 to past at midnight CDT', async () => {
      const today = await todayAt('2026-10-20T05:00:00.000Z')
      expect(inScope('upcoming', today)).toEqual({
        date: { greater_than_equal: '2026-10-20T00:00:00.000Z' },
      })
      expect(inScope('past', today)).toEqual({ date: { less_than: '2026-10-20T00:00:00.000Z' } })
    })

    it('turns over an hour later in winter, at midnight CST', async () => {
      expect(inScope('upcoming', await todayAt('2026-01-15T05:59:59.000Z'))).toEqual({
        date: { greater_than_equal: '2026-01-14T00:00:00.000Z' },
      })
      expect(inScope('upcoming', await todayAt('2026-01-15T06:00:00.000Z'))).toEqual({
        date: { greater_than_equal: '2026-01-15T00:00:00.000Z' },
      })
    })
  })
})
