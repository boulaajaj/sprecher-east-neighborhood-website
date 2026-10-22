import { generateExpiredPayloadCookie, generatePayloadCookie } from 'payload'
import { describe, expect, it } from 'vitest'

import { toResponseCookie } from './cookies'

// Payload's defaults for a collection with `auth: true`
const authConfig = {
  cookies: { sameSite: 'Lax' as const, secure: false, domain: undefined },
  tokenExpiration: 7200,
}

describe('toResponseCookie', () => {
  it('keeps every setting of Payload’s auth cookie, in the shape Next.js sets', () => {
    const cookie = generatePayloadCookie({
      collectionAuthConfig: authConfig as never,
      cookiePrefix: 'payload',
      returnCookieAsObject: true,
      token: 'abc',
    })
    const result = toResponseCookie(cookie)
    expect(result).toMatchObject({
      name: 'payload-token',
      value: 'abc',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: undefined, // Payload leaves the flag off when `secure` is false
    })
    expect(result.expires?.toUTCString()).toBe(cookie.expires)
  })

  it('keeps the domain and the secure flag when Payload sets them', () => {
    const result = toResponseCookie({
      name: 'payload-token',
      value: 'abc',
      domain: 'example.com',
      secure: true,
      sameSite: 'Strict',
    })
    expect(result).toMatchObject({ domain: 'example.com', secure: true, sameSite: 'strict' })
  })

  it('turns Payload’s expired cookie into one with no value and a past expiry', () => {
    const expired = generateExpiredPayloadCookie({
      collectionAuthConfig: authConfig as never,
      cookiePrefix: 'payload',
      returnCookieAsObject: true,
    })
    const result = toResponseCookie(expired)
    expect(result).toMatchObject({ name: 'payload-token', value: '', httpOnly: true, path: '/' })
    expect(result.expires && result.expires.getTime() < Date.now()).toBe(true)
  })
})
