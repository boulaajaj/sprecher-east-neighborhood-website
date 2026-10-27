import type { CollectionBeforeChangeHook } from 'payload'

import { ROLES } from '@/platform/lib'

import { SOCIAL_SIGN_IN_CONTEXT } from '../domain/socialSignIn'

/**
 * An account a provider sign-in creates is always a resident (decision 0016): whatever the
 * create's data says, the role is forced here, so a mistake in that code can't grant more. It
 * keys on the context flag, not on `req.user`, because the seed and Payload's first-user screen
 * create admins with no user either. The flag can only lower a role.
 */
export const residentOnlyFromProviders: CollectionBeforeChangeHook = ({
  context,
  data,
  operation,
}) => {
  if (operation !== 'create' || context[SOCIAL_SIGN_IN_CONTEXT] !== true) return data
  return { ...data, role: ROLES.resident }
}
