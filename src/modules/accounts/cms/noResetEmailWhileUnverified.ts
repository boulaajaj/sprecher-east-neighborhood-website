import type { CollectionBeforeOperationHook } from 'payload'

import { USERS } from '../domain/usersCollection'

/**
 * Sends no reset email to an account whose email isn't verified yet (#187). Payload 3.91's forgot
 * password doesn't check `_verified`, so without this anyone could create an account with someone
 * else's address and have reset emails sent there. The operation still runs and answers as usual
 * (the same answer for every email, so nobody learns an account exists); only its email is off,
 * through the operation's own `disableEmail` option. The reset token it stores reaches nobody.
 *
 * Unverified means `_verified === false`, as Payload's sign-in reads it: accounts from before
 * verification was turned on are verified by the migration that added it.
 */
export const noResetEmailWhileUnverified: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  if (operation !== 'forgotPassword') return args
  const email = toLookupEmail(args.data)
  if (!email) return args

  const { docs } = await req.payload.find({
    collection: USERS,
    // Payload looks the account up the same way: the email trimmed and lowercase
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    pagination: false,
    // A visitor asking for a reset link may read no account: the server reads this one flag
    // to decide, and nothing about it reaches the visitor
    overrideAccess: true,
    showHiddenFields: true,
    req,
  })
  const unverified = docs[0]?._verified === false
  return unverified ? { ...args, disableEmail: true } : args
}

/** The email the request names, as Payload's forgot password looks it up, or `null`. */
function toLookupEmail(data: unknown): string | null {
  const email = data && typeof data === 'object' && 'email' in data ? data.email : null
  return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null
}
