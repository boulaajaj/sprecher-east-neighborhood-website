import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { newConfirmationToken } from './token'
import { fakeRequest } from '../testing/fakeRequest'
import { confirmEmail } from './confirmEmail'

const HOUR = 60 * 60 * 1000
const NOW = Date.parse('2026-10-22T12:00:00.000Z')
const iso = (ms: number) => new Date(ms).toISOString()

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.com')
})

afterEach(() => {
  vi.useRealTimers()
})

/** A request with one address whose link was sent `sentAgo` ms ago; returns the link's token. */
function withLink(sentAgo = HOUR, confirmedAt: string | null = null) {
  const fake = fakeRequest()
  const { token, tokenHash } = newConfirmationToken()
  fake.docs.push({
    id: 1,
    email: 'ana@example.com',
    confirmedAt,
    tokenHash,
    tokenExpiresAt: iso(NOW - sentAgo + 24 * HOUR),
    lastSentAt: iso(NOW - sentAgo),
  })
  return { ...fake, token }
}

describe('confirmEmail', () => {
  it('confirms the address, runs the listeners, then sends the welcome email once', async () => {
    const { docs, sent, req, token } = withLink()
    const listener = vi.fn(async () => {})

    expect(await confirmEmail(token, req, [listener])).toBe('confirmed')
    expect(docs[0]).toMatchObject({ confirmedAt: iso(NOW), welcomeSentAt: iso(NOW) })
    expect(listener).toHaveBeenCalledWith('ana@example.com', req)
    expect(sent.map((email) => [email.to, email.subject])).toEqual([
      ['ana@example.com', 'Welcome to Sprecher East'],
    ])

    expect(await confirmEmail(token, req, [listener])).toBe('already-confirmed')
    expect(listener).toHaveBeenCalledOnce()
    expect(sent).toHaveLength(1)
  })

  it('confirms once when two clicks arrive at the same time', async () => {
    const { docs, payload, sent, req, token } = withLink()
    const listener = vi.fn(async () => {})

    // Both clicks read the record before either writes, so only the write's own condition
    // (confirmedAt still empty) can tell them apart
    const outcomes = await Promise.all([
      confirmEmail(token, req, [listener]),
      confirmEmail(token, req, [listener]),
    ])

    expect(outcomes.sort()).toEqual(['already-confirmed', 'confirmed'])
    expect(listener).toHaveBeenCalledOnce()
    expect(sent).toHaveLength(1)
    expect(payload.db.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { and: [{ id: { equals: 1 } }, { confirmedAt: { exists: false } }] },
        data: { confirmedAt: iso(NOW), welcomeSentAt: iso(NOW), updatedAt: iso(NOW) },
      }),
    )
    expect(docs[0]?.confirmedAt).toBe(iso(NOW))
  })

  it('says a link expired 24 hours after it was sent, and changes nothing', async () => {
    const { docs, sent, req, token } = withLink(24 * HOUR)
    expect(await confirmEmail(token, req, [])).toBe('expired')
    expect(docs[0]?.confirmedAt).toBeNull()
    expect(sent).toEqual([])
  })

  it('says a link is not valid when its token is unknown or malformed', async () => {
    const { req } = withLink()
    expect(await confirmEmail(newConfirmationToken().token, req, [])).toBe('invalid')
    expect(await confirmEmail('not-a-token', req, [])).toBe('invalid')
    expect(await confirmEmail(undefined, req, [])).toBe('invalid')
  })

  it('still confirms and welcomes when a listener fails, logging no address', async () => {
    const { payload, sent, req, token } = withLink()
    const failing = vi.fn(async () => {
      throw new Error('ana@example.com')
    })
    const after = vi.fn(async () => {})

    expect(await confirmEmail(token, req, [failing, after])).toBe('confirmed')
    expect(after).toHaveBeenCalled()
    expect(sent).toHaveLength(1)
    expect(payload.logger.error).toHaveBeenCalledWith(
      'A step after confirming an email failed (Error)',
    )
  })

  it('stays confirmed when the welcome email fails', async () => {
    const { docs, payload, req, token } = withLink()
    payload.sendEmail.mockRejectedValueOnce(new Error('SMTP down'))
    expect(await confirmEmail(token, req, [])).toBe('confirmed')
    expect(docs[0]?.confirmedAt).toBe(iso(NOW))
    expect(payload.logger.error).toHaveBeenCalledWith('Sending the welcome email failed (Error)')
  })
})
