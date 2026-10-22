import 'server-only'

import configPromise from '@payload-config'
import { cookies, headers } from 'next/headers'
import {
  createLocalReq,
  generateExpiredPayloadCookie,
  generatePayloadCookie,
  getPayload,
  logoutOperation,
  type Payload,
  type TypedUser,
} from 'payload'

import type { PasswordChangeValues, SignInValues } from '../domain/credentials'
import type { CurrentUser } from '../domain/types'
import { toResponseCookie } from './cookies'
import { isRefusal } from './failures'
import { toCurrentUser } from './mappers'

const USERS = 'users'

/** The Payload user this request's auth cookie belongs to, or null (Payload's own check). */
async function getSessionPayloadUser(): Promise<TypedUser | null> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  return user
}

/** Who is signed in for this request, or null. */
export async function getSessionUser(): Promise<CurrentUser | null> {
  const user = await getSessionPayloadUser()
  return user ? toCurrentUser(user) : null
}

/**
 * Signs in with Payload's `login` operation and sets the auth cookie Payload's own
 * `POST /api/users/login` sets: same name, lifetime, httpOnly, sameSite and secure settings.
 * Throws Payload's error when it refuses, after counting the attempt towards the lockout.
 * (Payload's Next.js helpers in `@payloadcms/next/auth` aren't used: they are a `'use server'`
 * module, and their `logout` deletes the first cookie named `payload…`, which can be the
 * admin's `payload-theme`.)
 */
export async function startSession({ email, password }: SignInValues): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  const { token } = await payload.login({
    collection: USERS,
    data: { email, password },
    // As `POST /api/users/login` runs it: the returned user is read with access rules applied
    overrideAccess: false,
  })
  if (!token) throw new Error('Payload signed in without a token')
  const cookie = generatePayloadCookie({
    collectionAuthConfig: payload.collections[USERS].config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  })
  const cookieStore = await cookies()
  cookieStore.set(toResponseCookie(cookie))
}

/**
 * Ends this request's session the way `POST /api/users/logout` does: Payload forgets the session,
 * then the auth cookie is replaced with Payload's expired one. The cookie is cleared even when
 * Payload fails to forget the session, so signing out always signs this browser out.
 */
export async function endSession(): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  const users = payload.collections[USERS]
  try {
    const user = await getSessionPayloadUser()
    if (user) {
      await logoutOperation({ collection: users, req: await createLocalReq({ user }, payload) })
    }
  } finally {
    const expired = generateExpiredPayloadCookie({
      collectionAuthConfig: users.config.auth,
      cookiePrefix: payload.config.cookiePrefix,
      returnCookieAsObject: true,
    })
    const cookieStore = await cookies()
    cookieStore.set(toResponseCookie(expired))
  }
}

/** How a password change ended, when it didn't throw. */
export type PasswordChangeOutcome = 'changed' | 'signed-out' | 'wrong-password'

/**
 * Sets a new password on the signed-in account only, once its current password is confirmed
 * (#233): the account comes from the session, and the users collection's access rules still
 * apply (`isAdminOrSelf`). Throws Payload's error when it refuses the new password.
 *
 * Payload keeps only this request's session when a password changes, so the browser stays signed
 * in and every other session ends, including the one the check below records.
 */
export async function setOwnPassword({
  currentPassword,
  newPassword,
}: Pick<PasswordChangeValues, 'currentPassword' | 'newPassword'>): Promise<PasswordChangeOutcome> {
  const user = await getSessionPayloadUser()
  if (!user) return 'signed-out'
  const payload = await getPayload({ config: configPromise })
  if (!(await isOwnPassword(payload, user, currentPassword))) return 'wrong-password'
  await payload.update({
    collection: USERS,
    id: user.id,
    data: { password: newPassword },
    depth: 0,
    overrideAccess: false,
    user,
  })
  return 'changed'
}

/**
 * Checks a password against the session's own account with Payload's `login` operation, as
 * `POST /api/users/login` runs it, so a wrong one counts towards the lockout. The email is the
 * session's, never the caller's. Its token is dropped and no cookie is set; the session it
 * records ends when the password changes. Throws when Payload fails rather than refuses.
 */
async function isOwnPassword(
  payload: Payload,
  user: TypedUser,
  password: string,
): Promise<boolean> {
  try {
    await payload.login({
      collection: USERS,
      data: { email: user.email, password },
      overrideAccess: false,
    })
    return true
  } catch (error) {
    if (isRefusal(error)) return false
    throw error
  }
}
