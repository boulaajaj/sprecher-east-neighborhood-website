import type { Access } from 'payload'

import type { User } from '@/payload-types'
import { ROLES } from './roles'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  const typedUser = user as User | null
  const role = typedUser?.role

  // Admins and editors see all records including drafts
  if (role === ROLES.admin || role === ROLES.editor) {
    return true
  }

  // Residents and anonymous users see only published content
  return {
    _status: {
      equals: 'published',
    },
  }
}
