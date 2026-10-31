import type { Access } from 'payload'

import { hasAdminOrEditor } from './roles'

/** Staff see every document, drafts included; residents and visitors only published ones. */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (hasAdminOrEditor(user)) return true
  return { _status: { equals: 'published' } }
}
