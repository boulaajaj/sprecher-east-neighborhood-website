import 'server-only'

import configPromise from '@payload-config'
import { cookies, headers } from 'next/headers'
import {
  createLocalReq,
  generateExpiredPayloadCookie,
  generatePayloadCookie,
  getPayload,
  logoutOperation,
  type TypedUser,
} from 'payload'

import type { SignInValues } from '../domain/credentials'
import type { CurrentUser } from '../domain/types'
import { toResponseCookie } from './cookies'
import { toCurrentUser } from './mappers'

const USERS = 'users'

/** The Payload user this request's auth cookie belongs to, or null (Payload's own check). */
async function findSessionUser(): Promise<TypedUser | null> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  return user
}

/** Who is signed in for this request, or null. */
export async function getSessionUser(): Promise<CurrentUser | null> {
  const user = await findSessionUser()
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
  const { token } = await payload.login({ collection: USERS, data: { email, password } })
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
 * then the auth cookie is replaced with Payload's expired one.
 */
export async function endSession(): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  const users = payload.collections[USERS]
  const user = await findSessionUser()
  if (user) {
    await logoutOperation({ collection: users, req: await createLocalReq({ user }, payload) })
  }
  const expired = generateExpiredPayloadCookie({
    collectionAuthConfig: users.config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
  })
  const cookieStore = await cookies()
  cookieStore.set(toResponseCookie(expired))
}

/**
 * Sets a new password on the signed-in account only: the id comes from the session, and the
 * users collection's access rules still apply (`isAdminOrSelf`). Returns false when nobody is
 * signed in; throws Payload's error when it refuses.
 */
export async function setOwnPassword(password: string): Promise<boolean> {
  const user = await findSessionUser()
  if (!user) return false
  const payload = await getPayload({ config: configPromise })
  await payload.update({
    collection: USERS,
    id: user.id,
    data: { password },
    depth: 0,
    overrideAccess: false,
    user,
  })
  return true
}
