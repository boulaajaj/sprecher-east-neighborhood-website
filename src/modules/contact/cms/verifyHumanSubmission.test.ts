import { APIError } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import {
  HUMAN_CHECK_TOKEN_HEADER,
  type HumanCheck,
  type HumanVerifier,
} from '@/platform/lib/humanCheck'
import { verifyHumanSubmission } from './verifyHumanSubmission'

/** The test double: answers what the test says and records the tokens it was asked about. */
class FakeHumanVerifier implements HumanVerifier {
  readonly tokens: Array<string | null | undefined> = []

  constructor(
    private readonly answer: HumanCheck = { ok: true },
    private readonly enabled = true,
  ) {}

  isEnabled() {
    return this.enabled
  }

  async verify(token: string | null | undefined) {
    this.tokens.push(token)
    return this.answer
  }
}

type HookArgs = Parameters<ReturnType<typeof verifyHumanSubmission>>[0]

/** Runs the hook as Payload would for a submission; returns its result or error, and the log. */
async function submit(
  verifier: HumanVerifier,
  {
    token = 'the-token' as string | null,
    role = null as 'admin' | 'editor' | 'resident' | null,
    operation = 'create',
  } = {},
) {
  const warn = vi.fn()
  try {
    const result = await verifyHumanSubmission(verifier)({
      data: { form: 1 },
      operation,
      req: {
        user: role ? { id: 1, role } : null,
        headers: new Headers(token ? { [HUMAN_CHECK_TOKEN_HEADER]: token } : {}),
        payload: { logger: { warn } },
      },
    } as unknown as HookArgs)
    return { result, warn }
  } catch (error) {
    return { error: error as APIError, warn }
  }
}

describe('verifyHumanSubmission', () => {
  it('lets a submission through when the robot check passes, sending it the header token', async () => {
    const verifier = new FakeHumanVerifier({ ok: true })
    const { result, error } = await submit(verifier)
    expect(error).toBeUndefined()
    expect(result).toEqual({ form: 1 })
    expect(verifier.tokens).toEqual(['the-token'])
  })

  it('rejects a failed check with a fixed 400 message, and logs only the reason', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'timeout-or-duplicate' })
    const { error, warn } = await submit(verifier)
    expect(error).toBeInstanceOf(APIError)
    expect(error?.status).toBe(400)
    expect(error?.message).toBe('We couldn’t confirm you’re not a robot. Please try again.')
    expect(warn).toHaveBeenCalledExactlyOnceWith(
      'Robot check rejected a form submission: timeout-or-duplicate',
    )
  })

  it('asks the verifier with no token when the header is missing', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'missing-token' })
    expect((await submit(verifier, { token: null })).error?.status).toBe(400)
    expect(verifier.tokens).toEqual([null])
  })

  it('skips the check while the verifier is off', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'never asked' }, false)
    expect((await submit(verifier)).result).toEqual({ form: 1 })
    expect(verifier.tokens).toEqual([])
  })

  it.each(['admin', 'editor'] as const)('never checks a signed-in %s', async (role) => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'never asked' })
    expect((await submit(verifier, { role })).result).toEqual({ form: 1 })
    expect(verifier.tokens).toEqual([])
  })

  it('still checks a signed-in resident', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'missing-token' })
    expect((await submit(verifier, { role: 'resident' })).error).toBeInstanceOf(APIError)
  })

  it('checks only new submissions, not updates', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'never asked' })
    expect((await submit(verifier, { operation: 'update' })).result).toEqual({ form: 1 })
    expect(verifier.tokens).toEqual([])
  })
})
