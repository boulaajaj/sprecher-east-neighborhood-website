import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { ROLES } from '@/platform/lib'

import type { SignUpValues, VerifyAccountValues } from '../domain/credentials'
import { USERS } from '../domain/usersCollection'

/**
 * Creates a resident account with Payload's `create` operation (#187). With `auth.verify` on the
 * users collection, Payload stores it unverified, with a one-time token, and emails the link
 * (`auth.verify` in `cms/users.ts`); it can't sign in until that link is opened. Throws Payload's
 * error when it refuses (400: an account already uses the email) or fails.
 */
export async function createResidentAccount({
  name,
  email,
  newPassword,
}: Pick<SignUpValues, 'name' | 'email' | 'newPassword'>): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.create({
    collection: USERS,
    // Built here from the parsed form only: the role is always resident, and nothing else a
    // visitor sends (such as `_verified`) can reach the account
    data: { name, email, password: newPassword, role: ROLES.resident },
    depth: 0,
    // The collection lets only admins create accounts (`create: isAdmin`), so `POST /api/users`
    // stays closed to visitors. This is the one way a visitor gets an account, and the server
    // decides everything about it but the name, email and password.
    overrideAccess: true,
  })
}

/**
 * Deletes the unverified account `createResidentAccount` stored for `email` at or after `since`,
 * when its verification email then failed (#187). Without it the address would be stuck: SQLite
 * runs Payload's `create` without a transaction, so the account stays, a second sign-up is refused
 * as a duplicate, and an unverified account gets no reset email. Verified accounts, and accounts
 * older than this request, are never touched.
 */
export async function deleteFailedSignUp(email: string, since: Date): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.delete({
    collection: USERS,
    where: {
      and: [
        { email: { equals: email } },
        { _verified: { not_equals: true } },
        { createdAt: { greater_than_equal: since.toISOString() } },
      ],
    },
    depth: 0,
    // Visitors can't delete accounts (`delete: isAdmin`); this undoes the server's own create
    overrideAccess: true,
  })
}

/**
 * Opens a verification link with Payload's `verifyEmail` operation, which marks the account
 * verified and clears the token, so the link works once. Throws Payload's error when it refuses
 * (403: unknown or used token). Payload's operation takes no `overrideAccess`: the token is the
 * proof, as on `POST /api/users/verify/<token>`.
 */
export async function verifyAccountToken({ token }: VerifyAccountValues): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.verifyEmail({ collection: USERS, token })
}
