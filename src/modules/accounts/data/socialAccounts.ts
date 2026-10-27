import 'server-only'

import { randomBytes } from 'node:crypto'

import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { createLocalReq, getFieldsToSign, getPayload, jwtSign, type Payload } from 'payload'
import { addSessionToUser, generatePayloadCookie } from 'payload/shared'

import type { User } from '@/payload-types'
import { ROLES } from '@/platform/lib'

import {
  SOCIAL_FLOW_COOKIE,
  SOCIAL_FLOW_PATH,
  SOCIAL_FLOW_TTL_MS,
  SOCIAL_LINK_COOKIE,
  SOCIAL_LINK_TTL_MS,
  toPendingSocialLink,
  toSocialFlow,
  type PendingSocialLink,
  type SocialFlow,
} from '../domain/socialCookies'
import {
  SOCIAL_SIGN_IN_CONTEXT,
  SOCIAL_SUBJECT_FIELDS,
  toAccountName,
  type SocialAccount,
  type SocialProfile,
  type SocialProvider,
} from '../domain/socialSignIn'
import { purposeKey, readSignedValue, signValue } from '../domain/signedValue'
import { USERS } from '../domain/usersCollection'

// The account side of a sign-in with a provider (#188, decision 0016): finding, creating and
// linking accounts, starting Payload's own session, and the two signed cookies.

/** A password nobody knows, for an account a provider creates: Payload's accounts need one. */
const unknownPassword = () => randomBytes(32).toString('base64url')

const secure = () => process.env.NODE_ENV === 'production'

async function payloadClient(): Promise<Payload> {
  return getPayload({ config: configPromise })
}

/** What the sign-in rule needs to know about an account. */
type AccountRow = {
  id: number
  role?: string | null
  _verified?: boolean | null
  lockUntil?: string | null
  email?: string
}

const toSocialAccount = (row: AccountRow): SocialAccount => ({
  id: row.id,
  role: row.role ?? ROLES.resident,
  verified: row._verified !== false,
  lockedUntil: row.lockUntil ? new Date(row.lockUntil) : null,
})

/** The account this provider's subject is linked to, or null. */
export async function findAccountBySubject(
  provider: SocialProvider,
  subject: string,
): Promise<SocialAccount | null> {
  const payload = await payloadClient()
  // The database adapter, as Payload's own login reads accounts: it returns `lockUntil` and
  // `_verified`, which the collection's access never shows
  const row = (await payload.db.findOne({
    collection: USERS,
    where: { [SOCIAL_SUBJECT_FIELDS[provider]]: { equals: subject } },
  })) as AccountRow | null
  return row ? toSocialAccount(row) : null
}

/** The account that uses this email, or null. */
export async function findAccountByEmail(email: string): Promise<SocialAccount | null> {
  const payload = await payloadClient()
  const row = (await payload.db.findOne({
    collection: USERS,
    where: { email: { equals: email } },
  })) as AccountRow | null
  return row ? toSocialAccount(row) : null
}

/**
 * A new resident account for a Google sign-in, already verified, since Google verified the email:
 * Payload sends no verification email. The role is forced to resident by the collection too.
 */
export async function createVerifiedAccount(profile: SocialProfile): Promise<number> {
  if (!profile.email) throw new Error('No email to create an account with')
  const payload = await payloadClient()
  const account = await payload.create({
    collection: USERS,
    data: {
      name: toAccountName(profile.name),
      email: profile.email,
      password: unknownPassword(),
      role: ROLES.resident,
      _verified: true,
      [SOCIAL_SUBJECT_FIELDS[profile.provider]]: profile.subject,
    },
    depth: 0,
    disableVerificationEmail: true,
    // Visitors can't create accounts (`create: isAdmin`), and `_verified` and the subject are
    // server-only: the server builds all of it from the provider's checked answer
    overrideAccess: true,
    context: { [SOCIAL_SIGN_IN_CONTEXT]: true },
  })
  return account.id
}

/**
 * A new, unverified resident account for a Facebook sign-in, with no Facebook account linked:
 * Payload emails the usual verification link (`auth.verify`), and the verify page asks the person
 * to choose a password before the account opens (#289), as for a resent link.
 */
export async function createUnconfirmedAccount(profile: SocialProfile): Promise<number> {
  if (!profile.email) throw new Error('No email to create an account with')
  const payload = await payloadClient()
  const account = await payload.create({
    collection: USERS,
    data: {
      name: toAccountName(profile.name),
      email: profile.email,
      password: unknownPassword(),
      role: ROLES.resident,
      verificationSetsPassword: true,
    },
    depth: 0,
    // As for the email sign-up: visitors can't create accounts, and the server builds the data
    overrideAccess: true,
    context: { [SOCIAL_SIGN_IN_CONTEXT]: true },
  })
  return account.id
}

/**
 * Links a provider's subject to an account, once that account's email is confirmed in the
 * browser that signed in with the provider. The subject column is unique, so the same Facebook
 * account can't end up on two accounts.
 */
export async function linkSubject(
  accountId: number,
  provider: SocialProvider,
  subject: string,
): Promise<void> {
  const payload = await payloadClient()
  await payload.db.updateOne({
    collection: USERS,
    id: accountId,
    data: { [SOCIAL_SUBJECT_FIELDS[provider]]: subject },
    returning: false,
  })
}

/**
 * Signs this browser in to an account, as Payload's `login` operation does once a password
 * matched: a new session on the account, the token Payload signs for it, and Payload's own auth
 * cookie with the collection's settings (Secure in production, #234). The caller has checked the
 * account isn't locked, unverified or an agent.
 */
export async function startSessionFor(accountId: number): Promise<void> {
  const payload = await payloadClient()
  const users = payload.collections[USERS].config
  // The stored row, as Payload's login reads it, so the new session is added to its sessions
  const row = await payload.db.findOne<User>({
    collection: USERS,
    where: { id: { equals: accountId } },
  })
  if (!row) throw new Error('The account to sign in to is gone')
  const user = { ...row, collection: 'users' as const }
  const { sid } = await addSessionToUser({
    collectionConfig: users,
    payload,
    req: await createLocalReq({}, payload),
    user,
  })
  const { token } = await jwtSign({
    fieldsToSign: getFieldsToSign({ collectionConfig: users, email: user.email, sid, user }),
    secret: payload.secret,
    tokenExpiration: users.auth.tokenExpiration,
  })
  const cookie = generatePayloadCookie({
    collectionAuthConfig: users.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  })
  const store = await cookies()
  store.set({
    name: cookie.name,
    value: token,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
    httpOnly: true,
    secure: cookie.secure,
    sameSite: 'lax',
  })
}

// The signed cookies, each with its own key derived from Payload's secret

async function keyFor(purpose: string): Promise<Buffer> {
  const payload = await payloadClient()
  return purposeKey(payload.secret, purpose)
}

/** Keeps a new sign-in's checks in this browser for the callback. */
export async function saveSocialFlow(flow: SocialFlow, now: Date): Promise<void> {
  const value = signValue(flow, await keyFor('social-flow'), now, SOCIAL_FLOW_TTL_MS)
  const store = await cookies()
  store.set({
    name: SOCIAL_FLOW_COOKIE,
    value,
    path: SOCIAL_FLOW_PATH,
    maxAge: SOCIAL_FLOW_TTL_MS / 1000,
    httpOnly: true,
    secure: secure(),
    sameSite: 'lax',
  })
}

/** The sign-in this browser started, or null. Clears it: a flow is used once. */
export async function takeSocialFlow(now: Date): Promise<SocialFlow | null> {
  const store = await cookies()
  const value = store.get(SOCIAL_FLOW_COOKIE)?.value
  store.delete({ name: SOCIAL_FLOW_COOKIE, path: SOCIAL_FLOW_PATH })
  return toSocialFlow(readSignedValue(value, await keyFor('social-flow'), now))
}

/** Remembers, in this browser, which provider account to link once the email is confirmed. */
export async function savePendingLink(link: PendingSocialLink, now: Date): Promise<void> {
  const value = signValue(link, await keyFor('social-link'), now, SOCIAL_LINK_TTL_MS)
  const store = await cookies()
  store.set({
    name: SOCIAL_LINK_COOKIE,
    value,
    path: '/',
    maxAge: SOCIAL_LINK_TTL_MS / 1000,
    httpOnly: true,
    secure: secure(),
    sameSite: 'lax',
  })
}

/** The link this browser is waiting to make, or null. Clears it: a link is tried once. */
export async function takePendingLink(now: Date): Promise<PendingSocialLink | null> {
  const store = await cookies()
  const value = store.get(SOCIAL_LINK_COOKIE)?.value
  if (!value) return null
  store.delete({ name: SOCIAL_LINK_COOKIE, path: '/' })
  return toPendingSocialLink(readSignedValue(value, await keyFor('social-link'), now))
}
