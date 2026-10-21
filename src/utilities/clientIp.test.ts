import { describe, expect, it } from 'vitest'

import { clientIpFromHeaders } from './clientIp'

describe('clientIpFromHeaders', () => {
  it('returns null without headers', () => {
    expect(clientIpFromHeaders(undefined)).toBeNull()
    expect(clientIpFromHeaders(null)).toBeNull()
  })

  it('uses the first X-Forwarded-For entry (the visitor, as set by Caddy)', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })
    expect(clientIpFromHeaders(headers)).toBe('203.0.113.7')
  })

  it('trims whitespace around the first entry', () => {
    expect(clientIpFromHeaders(new Headers({ 'x-forwarded-for': '  203.0.113.7 ,x' }))).toBe(
      '203.0.113.7',
    )
  })

  it('returns null when the first X-Forwarded-For entry is empty', () => {
    expect(clientIpFromHeaders(new Headers({ 'x-forwarded-for': ' , 10.0.0.1' }))).toBeNull()
  })

  it('falls back to X-Real-IP when X-Forwarded-For is absent', () => {
    expect(clientIpFromHeaders(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('returns null when neither header is present', () => {
    expect(clientIpFromHeaders(new Headers())).toBeNull()
  })
})
