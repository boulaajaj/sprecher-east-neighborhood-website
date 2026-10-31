import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from './authenticatedOrPublished'
import { isAdmin, isAdminOrEditor, isStaffOrAgent } from './roles'

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

/**
 * Content agents may suggest (events, posts, #336): as `draftContentAccess`, but an agent may also
 * create. What it creates is held as a suggested draft (`holdSuggestions`), and it can't update,
 * publish or delete.
 */
export const suggestibleContentAccess = {
  ...draftContentAccess,
  create: isStaffOrAgent,
} satisfies NonNullable<CollectionConfig['access']>
