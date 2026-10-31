import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fakeRequest } from '../testing/fakeRequest'
import { emailConfirmer } from './emailConfirmer'

const NOW = Date.parse('2026-10-22T12:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('emailConfirmer.isConfirmed', () => {
  it('is true only for an address whose link was clicked, in any letter case', async () => {
    const { docs, req } = fakeRequest()
    docs.push(
      { id: 1, email: 'ana@example.com', confirmedAt: '2026-10-21T00:00:00.000Z' },
      { id: 2, email: 'ben@example.com', confirmedAt: null },
    )
    expect(await emailConfirmer.isConfirmed('Ana@Example.com', req)).toBe(true)
    expect(await emailConfirmer.isConfirmed('ben@example.com', req)).toBe(false)
    expect(await emailConfirmer.isConfirmed('cy@example.com', req)).toBe(false)
    expect(await emailConfirmer.isConfirmed('not an address', req)).toBe(false)
  })

  it('counts as unconfirmed when the database fails, logging no address', async () => {
    const { payload, req } = fakeRequest()
    payload.find.mockRejectedValueOnce(new TypeError('SELECT … ana@example.com'))
    expect(await emailConfirmer.isConfirmed('ana@example.com', req)).toBe(false)
    expect(payload.logger.error).toHaveBeenCalledWith(
      'Checking an email confirmation failed (TypeError)',
    )
  })
})

describe('emailConfirmer.request', () => {
  it('sends a link and logs nothing', async () => {
    const { payload, sent, req } = fakeRequest()
    await emailConfirmer.request('ana@example.com', req)
    expect(sent).toHaveLength(1)
    expect(payload.logger.warn).not.toHaveBeenCalled()
  })

  it('logs why nothing was sent, without the address', async () => {
    const { payload, req } = fakeRequest()
    await emailConfirmer.request('not an address', req)
    expect(payload.logger.warn).toHaveBeenCalledWith('No confirmation email sent: invalid-address')
  })

  it('never throws, so the message that asked is kept', async () => {
    const { payload, req } = fakeRequest()
    payload.sendEmail.mockRejectedValueOnce(new Error('SMTP down for ana@example.com'))
    await expect(emailConfirmer.request('ana@example.com', req)).resolves.toBeUndefined()
    expect(payload.logger.error).toHaveBeenCalledWith(
      'Requesting an email confirmation failed (Error)',
    )
  })
})

describe('emailConfirmer and the caller’s transaction', () => {
  it('never passes the caller’s transaction to its own reads and writes', async () => {
    const { payload, req } = fakeRequest()
    req.transactionID = 'caller-tx'

    await emailConfirmer.isConfirmed('ana@example.com', req)
    await emailConfirmer.request('ana@example.com', req)

    const calls = [payload.find, payload.create, payload.delete].flatMap((fn) => fn.mock.calls)
    expect(calls.length).toBeGreaterThan(0)
    for (const [args] of calls) {
      expect((args as { req: { transactionID?: unknown } }).req.transactionID).toBeUndefined()
    }
    expect(req.transactionID).toBe('caller-tx')
  })
})
