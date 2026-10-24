import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { keepAccountEmails } from './keepAccountEmails'

describe('keepAccountEmails (#274)', () => {
  it('keeps the addresses an account uses, looked up with access bypassed', async () => {
    const find = vi.fn(async () => ({ docs: [{ id: 3, email: 'resident@example.com' }] }))
    const req = { payload: { find } } as unknown as PayloadRequest

    const kept = await keepAccountEmails(['resident@example.com', 'sender@example.com'], req)

    expect([...kept]).toEqual(['resident@example.com'])
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        where: { email: { in: ['resident@example.com', 'sender@example.com'] } },
        select: { email: true },
        overrideAccess: true,
        req,
      }),
    )
  })

  it('asks nothing for no addresses', async () => {
    const find = vi.fn()
    const req = { payload: { find } } as unknown as PayloadRequest
    expect((await keepAccountEmails([], req)).size).toBe(0)
    expect(find).not.toHaveBeenCalled()
  })
})
