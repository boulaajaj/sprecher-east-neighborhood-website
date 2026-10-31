import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { HumanVerifier } from '@/platform/lib'

const data = vi.hoisted(() => ({
  findPendingVerification: vi.fn(),
  setPasswordFromVerification: vi.fn(),
  verifyAccountToken: vi.fn(),
}))
vi.mock('server-only', () => ({}))
vi.mock('../data/signUp', () => data)

import { verifyAccountFromLink } from './verifyAccountFromLink'

const TOKEN = '0123456789abcdef0123456789abcdef01234567'

/** A robot check that is on and passes only the token "human". */
const checkOn: HumanVerifier = {
  isEnabled: () => true,
  verify: async (token) => (token === 'human' ? { ok: true } : { ok: false, reason: 'bad' }),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  data.findPendingVerification.mockResolvedValue({ id: 1, setsPassword: false })
  data.verifyAccountToken.mockResolvedValue(undefined)
})

describe('verifyAccountFromLink', () => {
  it('verifies nothing without a robot-check token that passes (#303)', async () => {
    for (const robotToken of [null, 'bot']) {
      expect(await verifyAccountFromLink({ token: TOKEN }, robotToken, checkOn)).toEqual({
        ok: false,
        failure: 'robot-check',
      })
    }
    expect(data.findPendingVerification).not.toHaveBeenCalled()
    expect(data.verifyAccountToken).not.toHaveBeenCalled()
  })

  it('verifies the link once the robot check passes', async () => {
    expect(await verifyAccountFromLink({ token: TOKEN }, 'human', checkOn)).toEqual({ ok: true })
    expect(data.verifyAccountToken).toHaveBeenCalledWith({ token: TOKEN })
  })

  it('skips the check while it is off (no keys configured)', async () => {
    const checkOff: HumanVerifier = { isEnabled: () => false, verify: vi.fn() }
    expect(await verifyAccountFromLink({ token: TOKEN }, null, checkOff)).toEqual({ ok: true })
    expect(checkOff.verify).not.toHaveBeenCalled()
  })
})
