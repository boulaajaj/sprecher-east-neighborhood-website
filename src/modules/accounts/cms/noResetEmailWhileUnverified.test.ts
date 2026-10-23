import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { noResetEmailWhileUnverified } from './noResetEmailWhileUnverified'

/** Runs the hook for an operation, with Payload's find answering `docs`. */
async function run(operation: string, data: unknown, docs: unknown[] = []) {
  const find = vi.fn(async () => ({ docs }))
  const req = { payload: { find } } as unknown as PayloadRequest
  const args = { data, req }
  const result = await noResetEmailWhileUnverified({
    args,
    operation,
    req,
  } as unknown as Parameters<typeof noResetEmailWhileUnverified>[0])
  return { args, result, find }
}

describe('noResetEmailWhileUnverified', () => {
  it('turns the reset email off for an account whose email isn’t verified', async () => {
    const { args, result, find } = await run('forgotPassword', { email: ' Ana@Example.com ' }, [
      { id: 9, _verified: false },
    ])
    expect(result).toEqual({ ...args, disableEmail: true })
    expect(find).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        collection: 'users',
        where: { email: { equals: 'ana@example.com' } },
        overrideAccess: true,
        showHiddenFields: true,
      }),
    )
  })

  it.each([
    ['a verified account', [{ id: 1, _verified: true }]],
    ['an account from before verification (null)', [{ id: 1, _verified: null }]],
    ['no account', []],
  ])('leaves the email on for %s', async (_, docs) => {
    const { args, result } = await run('forgotPassword', { email: 'ana@example.com' }, docs)
    expect(result).toBe(args)
  })

  it('does nothing for other operations or a request without an email', async () => {
    for (const [operation, data] of [
      ['login', { email: 'ana@example.com' }],
      ['create', { email: 'ana@example.com' }],
      ['forgotPassword', {}],
      ['forgotPassword', { email: '  ' }],
    ] as const) {
      const { args, result, find } = await run(operation, data)
      expect(result).toBe(args)
      expect(find).not.toHaveBeenCalled()
    }
  })
})
