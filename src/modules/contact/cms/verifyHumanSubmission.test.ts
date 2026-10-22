import { APIError } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import type { HumanCheck, HumanVerifier } from '../domain/humanVerifier'
import { TURNSTILE_TOKEN_HEADER } from '../domain/turnstile'
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

/** Runs the hook as Payload would for a submission, and returns the logger to inspect. */
async function submit(
  verifier: HumanVerifier,
  {
    token = 'the-token' as string | null,
    role = null as 'admin' | 'editor' | 'resident' | null,
    operation = 'create',
  } = {},
) {
  const warn = vi.fn()
  const data = { form: 1 }
  const result = await verifyHumanSubmission(verifier)({
    data,
    operation,
    req: {
      user: role ? { id: 1, role } : null,
      headers: new Headers(token ? { [TURNSTILE_TOKEN_HEADER]: token } : {}),
      payload: { logger: { warn } },
    },
  } as unknown as HookArgs)
  return { result, warn }
}

describe('verifyHumanSubmission', () => {
  it('lets a submission through when the robot check passes, sending it the header token', async () => {
    const verifier = new FakeHumanVerifier({ ok: true })
    const { result } = await submit(verifier)
    expect(result).toEqual({ form: 1 })
    expect(verifier.tokens).toEqual(['the-token'])
  })

  it('rejects a failed check with a fixed 400 message and logs only the reason', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'timeout-or-duplicate' })
    const error = await submit(verifier).catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(APIError)
    expect((error as APIError).status).toBe(400)
    expect((error as APIError).message).toBe(
      'We couldn’t confirm you’re not a robot. Please try again.',
    )
  })

  it('logs why the check failed, never the token', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'missing-token' })
    const warn = vi.fn()
    await verifyHumanSubmission(verifier)({
      data: {},
      operation: 'create',
      req: { user: null, headers: new Headers(), payload: { logger: { warn } } },
    } as unknown as HookArgs).catch(() => undefined)
    expect(warn).toHaveBeenCalledWith('Turnstile rejected a form submission: missing-token')
  })

  it('passes no token on to the verifier when the header is missing', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'missing-token' })
    await submit(verifier, { token: null }).catch(() => undefined)
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
    await expect(submit(verifier, { role: 'resident' })).rejects.toBeInstanceOf(APIError)
  })

  it('checks only new submissions, not updates', async () => {
    const verifier = new FakeHumanVerifier({ ok: false, reason: 'never asked' })
    expect((await submit(verifier, { operation: 'update' })).result).toEqual({ form: 1 })
    expect(verifier.tokens).toEqual([])
  })
})
