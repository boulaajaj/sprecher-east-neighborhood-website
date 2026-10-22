import { describe, expect, it } from 'vitest'

import { SlidingWindowCounter } from './slidingWindow'

const HOUR = 60 * 60 * 1000
const NOW = Date.parse('2026-10-22T12:00:00.000Z')

describe('SlidingWindowCounter', () => {
  it('takes up to the limit for one key, then refuses', () => {
    const counter = new SlidingWindowCounter(HOUR)
    for (let i = 0; i < 3; i++) expect(counter.tryTake('a', 3, NOW)).toBe(true)
    expect(counter.tryTake('a', 3, NOW)).toBe(false)
  })

  it('counts each key separately', () => {
    const counter = new SlidingWindowCounter(HOUR)
    counter.tryTake('a', 1, NOW)
    expect(counter.tryTake('b', 1, NOW)).toBe(true)
  })

  it('forgets what happened a full window ago', () => {
    const counter = new SlidingWindowCounter(HOUR)
    counter.tryTake('a', 1, NOW)
    expect(counter.tryTake('a', 1, NOW + HOUR - 1)).toBe(false)
    expect(counter.tryTake('a', 1, NOW + HOUR)).toBe(true)
  })

  it('says how much room is left and records several at once', () => {
    const counter = new SlidingWindowCounter(HOUR)
    expect(counter.room('site', 5, NOW)).toBe(5)
    counter.record('site', NOW, 3)
    expect(counter.room('site', 5, NOW)).toBe(2)
    counter.record('site', NOW, 4)
    expect(counter.room('site', 5, NOW)).toBe(0)
  })

  it('forgets the least recently used key past its size limit', () => {
    const counter = new SlidingWindowCounter(HOUR, 2)
    counter.tryTake('a', 2, NOW)
    counter.tryTake('b', 2, NOW)
    counter.tryTake('a', 2, NOW) // a is used again, so b is now the least recent
    counter.tryTake('c', 2, NOW)
    expect(counter.room('a', 2, NOW)).toBe(0)
    expect(counter.room('b', 2, NOW)).toBe(2)
  })

  it('forgets the oldest key past its size limit', () => {
    const counter = new SlidingWindowCounter(HOUR, 2)
    counter.tryTake('a', 1, NOW)
    counter.tryTake('b', 1, NOW)
    counter.tryTake('c', 1, NOW)
    expect(counter.tryTake('a', 1, NOW)).toBe(true)
    expect(counter.tryTake('c', 1, NOW)).toBe(false)
  })
})
