import { describe, expect, it } from 'vitest'

import { hashConfirmationToken, newConfirmationToken } from './token'
import { parseConfirmationToken } from './tokenFormat'

describe('newConfirmationToken', () => {
  it('makes a different 43-character URL-safe token each time, with its hash', () => {
    const first = newConfirmationToken()
    const second = newConfirmationToken()
    expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(first.token).not.toBe(second.token)
    expect(first.tokenHash).toBe(hashConfirmationToken(first.token))
  })
})

describe('hashConfirmationToken', () => {
  it('is the SHA-256 in hex, never the token itself', () => {
    const hash = hashConfirmationToken('abc')
    expect(hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('parseConfirmationToken', () => {
  it('accepts a token the site made', () => {
    const { token } = newConfirmationToken()
    expect(parseConfirmationToken(token)).toBe(token)
  })

  it('refuses anything else', () => {
    for (const value of ['', 'short', `${'a'.repeat(42)}=`, 'a'.repeat(44), 42, null, undefined]) {
      expect(parseConfirmationToken(value)).toBeNull()
    }
  })
})
