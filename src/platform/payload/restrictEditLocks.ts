import type { SanitizedConfig } from 'payload'

import { isAdminOrEditor } from './roles'

const EDIT_LOCKS = 'payload-locked-documents'

/**
 * Edit locks ("someone is editing this") exist only for the admin screens, so only staff may
 * read, create, change or delete them (#147). Payload 3.91 adds this collection itself, with its
 * default access (any signed-in user) and no option to override it, so the rule is set on the
 * built config instead. A resident could otherwise lock a page under an editor's name.
 */
export function restrictEditLocks(config: SanitizedConfig): SanitizedConfig {
  const locks = config.collections.find((collection) => collection.slug === EDIT_LOCKS)
  if (locks) {
    locks.access = {
      ...locks.access,
      read: isAdminOrEditor,
      create: isAdminOrEditor,
      update: isAdminOrEditor,
      delete: isAdminOrEditor,
    }
  }
  return config
}
