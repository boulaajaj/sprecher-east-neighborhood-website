import { AuthenticationError, type CollectionBeforeLoginHook } from 'payload'

import { ROLES } from '@/platform/lib'

/**
 * Refuses password sign-in to agent accounts (#336): an agent acts only through its MCP API key,
 * which an admin can revoke, and never gets a session cookie or the admin panel. The refusal reads
 * like a wrong password, as every other sign-in refusal does.
 */
export const noPasswordSignInForAgents: CollectionBeforeLoginHook = ({ user }) => {
  if (user?.role === ROLES.agent) throw new AuthenticationError()
  return user
}
