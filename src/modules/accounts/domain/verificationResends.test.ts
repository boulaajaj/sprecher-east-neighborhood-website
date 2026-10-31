import { describe, expect, it } from 'vitest'

import { takeResend, VERIFICATION_RESENDS } from './verificationResends'

const at = (minutes: number) => new Date(Date.UTC(2026, 9, 23, 12, minutes))
const HOURS_3 = VERIFICATION_RESENDS.windowMs / 60_000

describe('takeResend', () => {
  it('allows the first resend and starts the window', () => {
    expect(takeResend({ resends: 0, since: null }, at(0))).toEqual({
      allowed: true,
      next: { resends: 1, since: at(0) },
    })
  })

  it('allows three resends in a window, then none until it ends', () => {
    let count = { resends: 0, since: null as Date | null }
    for (let i = 0; i < 3; i++) {
      const result = takeResend(count, at(i * 10))
      expect(result.allowed).toBe(true)
      if (result.allowed) count = result.next
    }
    expect(count).toEqual({ resends: 3, since: at(0) })
    expect(takeResend(count, at(HOURS_3 - 1))).toEqual({ allowed: false })
    // Three hours after the first resend, it starts over
    expect(takeResend(count, at(HOURS_3))).toEqual({
      allowed: true,
      next: { resends: 1, since: at(HOURS_3) },
    })
  })

  it('starts over when the last window ended, whatever its count', () => {
    expect(takeResend({ resends: 2, since: at(0) }, at(HOURS_3 + 5))).toEqual({
      allowed: true,
      next: { resends: 1, since: at(HOURS_3 + 5) },
    })
  })
})
