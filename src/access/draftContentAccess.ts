import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from './authenticatedOrPublished'
import { isAdmin, isAdminOrEditor } from './roles'

/**
 * Access for content with drafts (pages, posts, events, FAQ, resources). Staff write and see
 * drafts; everyone else reads published documents only. `readVersions` is set because Payload
 * otherwise lets any signed-in user read every version, drafts included (#140).
 */
export const draftContentAccess = {
  create: isAdminOrEditor,
  read: authenticatedOrPublished,
  readVersions: isAdminOrEditor,
  update: isAdminOrEditor,
  delete: isAdmin,
} satisfies NonNullable<CollectionConfig['access']>
