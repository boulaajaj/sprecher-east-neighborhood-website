import { generatePayloadCookie, type SanitizedCollectionConfig } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  isAdmin,
  isAdminFieldAccess,
  isAdminOrEditorBoolean,
  isAdminOrSelf,
} from '@/platform/payload/roles'

import { requireCurrentPassword } from './requireCurrentPassword'
import { Users } from './users'

describe('Users', () => {
  it('uses the shared role checks for every operation', () => {
    expect(Users.access).toEqual({
      admin: isAdminOrEditorBoolean,
      create: isAdmin,
      delete: isAdmin,
      read: isAdminOrSelf,
      unlock: isAdmin,
      update: isAdminOrSelf,
    })
  })

  it('signs in with email and password, Payload’s defaults apart from the cookie’s Secure flag', () => {
    // Tests don't run in production, so the flag is off here; the tests below cover both
    expect(Users.auth).toEqual({ cookies: { secure: false } })
  })

  it('asks for the current password before anyone changes their own (#233)', () => {
    expect(Users.hooks).toEqual({ beforeChange: [requireCurrentPassword] })
  })

  it('makes new accounts residents, and only admins may set a role', () => {
    const role = Users.fields.find((field) => 'name' in field && field.name === 'role')
    expect(role).toMatchObject({
      type: 'select',
      required: true,
      defaultValue: 'resident',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Resident', value: 'resident' },
      ],
      access: { create: isAdminFieldAccess, update: isAdminFieldAccess },
    })
  })
})

/**
 * The sign-in cookie as Payload builds it from the real, sanitized config (#234): the same
 * `generatePayloadCookie` that `POST /api/users/login` and the sign-in action use.
 */
async function signInCookie(nodeEnv: string) {
  vi.stubEnv('NODE_ENV', nodeEnv)
  vi.resetModules()
  const config = await (await import('@payload-config')).default
  const users = config.collections.find(
    (collection: SanitizedCollectionConfig) => collection.slug === 'users',
  )
  if (!users?.auth) throw new Error('No users collection with auth')
  return generatePayloadCookie({
    collectionAuthConfig: users.auth,
    cookiePrefix: config.cookiePrefix,
    returnCookieAsObject: true,
    token: 'jwt',
  })
}

describe('the sign-in cookie', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is Secure, HttpOnly and Lax in production, so browsers send it over HTTPS only', async () => {
    expect(await signInCookie('production')).toMatchObject({
      name: 'payload-token',
      secure: true,
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
    })
  })

  it('has no Secure flag in development, so signing in over http://localhost works', async () => {
    const cookie = await signInCookie('development')
    expect(cookie.secure).toBeUndefined()
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax' })
  })

  it('has no Secure flag in tests either: only a production build turns it on', async () => {
    expect((await signInCookie('test')).secure).toBeUndefined()
  })
})
