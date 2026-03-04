import type { Access } from 'payload'

/**
 * Allows a user to update only their own record.
 * Admins bypass this via Payload's separate `access.admin` check.
 * Use on user-facing collections where ownership matters (e.g., Users).
 */
export const authenticatedSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if (!id) return false
  return user.id === id
}
