import { describe, expect, it } from 'vitest'

import { needsRecentSenders, type SubmissionAge, toExpiredSubmissionIds } from './retention'

const HOUR = 60 * 60 * 1000
const NOW = Date.parse('2026-10-24T12:00:00.000Z')
const iso = (ms: number) => new Date(ms).toISOString()
/** 12 calendar months before NOW. */
const YEAR_AGO = Date.parse('2025-10-24T12:00:00.000Z')

const held = (id: number, createdAt: number): SubmissionAge => ({
  id,
  createdAt: iso(createdAt),
  senderEmail: 'ana@example.com',
  emailConfirmed: false,
})
const confirmed = (id: number, createdAt: number, senderEmail = 'ana@example.com') => ({
  id,
  createdAt: iso(createdAt),
  senderEmail,
  emailConfirmed: true,
})

/** The contact form (id 1) asks for an email; the survey (id 2) doesn't. */
const context = (recent: string[] = []) => ({
  formsAskingForEmail: new Set([1]),
  recentSenders: new Set(recent),
})

describe('toExpiredSubmissionIds (#274)', () => {
  it('deletes a message waiting for confirmation 48 hours after it was sent, not before', () => {
    const messages = [held(1, NOW - 48 * HOUR - 1), held(2, NOW - 48 * HOUR), held(3, NOW - HOUR)]
    expect(toExpiredSubmissionIds(messages, context(), NOW)).toEqual([1])
  })

  it('deletes a confirmed sender’s messages 12 months after their last message', () => {
    const messages = [confirmed(1, YEAR_AGO - 1), confirmed(2, YEAR_AGO)]
    expect(toExpiredSubmissionIds(messages, context(), NOW)).toEqual([1])
  })

  it('keeps a confirmed sender’s old messages while they wrote again in the last 12 months', () => {
    const messages = [
      confirmed(1, YEAR_AGO - 30 * 24 * HOUR, 'ana@example.com'),
      confirmed(2, YEAR_AGO - 30 * 24 * HOUR, 'ben@example.com'),
    ]
    expect(toExpiredSubmissionIds(messages, context(['ana@example.com']), NOW)).toEqual([2])
  })

  it('deletes a message from a form with no email field 12 months after it was sent', () => {
    const messages: SubmissionAge[] = [
      { id: 1, form: 2, createdAt: iso(YEAR_AGO - 1), senderEmail: null, emailConfirmed: false },
      { id: 2, form: 2, createdAt: iso(NOW - 72 * HOUR), senderEmail: null, emailConfirmed: false },
    ]
    expect(toExpiredSubmissionIds(messages, context(), NOW)).toEqual([1])
  })

  it('treats a message stored before #183 recorded the sender as unconfirmed: 48 hours', () => {
    // Columns added later: no address, and NULL rather than false
    const messages: SubmissionAge[] = [
      { id: 1, form: 1, createdAt: iso(NOW - 49 * HOUR), senderEmail: null, emailConfirmed: null },
      { id: 2, form: 1, createdAt: iso(NOW - 47 * HOUR), senderEmail: null, emailConfirmed: null },
    ]
    expect(toExpiredSubmissionIds(messages, context(), NOW)).toEqual([1])
  })

  it('treats a message whose form asked for an email but that has none (dropped) as unconfirmed', () => {
    const messages: SubmissionAge[] = [
      { id: 1, form: 1, createdAt: iso(NOW - 49 * HOUR), senderEmail: null, emailConfirmed: false },
    ]
    expect(toExpiredSubmissionIds(messages, context(), NOW)).toEqual([1])
  })

  it('never deletes a message on hold, confirmed or not', () => {
    const messages = [
      { ...held(1, NOW - 72 * HOUR), retentionHold: true },
      { ...confirmed(2, YEAR_AGO - 1), retentionHold: true },
    ]
    expect(toExpiredSubmissionIds(messages, context(), NOW)).toEqual([])
  })
})

describe('needsRecentSenders', () => {
  it('is true only for an old enough message from a confirmed sender', () => {
    expect(needsRecentSenders([confirmed(1, YEAR_AGO - 1)], NOW)).toBe(true)
    expect(needsRecentSenders([confirmed(1, YEAR_AGO)], NOW)).toBe(false)
    expect(needsRecentSenders([held(1, YEAR_AGO - 1)], NOW)).toBe(false)
    expect(
      needsRecentSenders([{ id: 1, createdAt: iso(YEAR_AGO - 1), senderEmail: null }], NOW),
    ).toBe(false)
  })
})
