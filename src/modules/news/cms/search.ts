import type { SearchPluginConfig } from '@payloadcms/plugin-search/types'

import { isAdminOrEditor } from '@/access/roles'

import { searchFields } from './searchFields'
import { beforeSyncWithSearch } from './searchSync'

/**
 * Search plugin options: what each search entry keeps (title, slug, search-engine fields,
 * categories) and who may manage the index. The plugin setup (src/plugins/index.ts) chooses
 * which collections it indexes, so this module names no other module's collection.
 */
export const searchOptions: Omit<SearchPluginConfig, 'collections'> = {
  beforeSync: beforeSyncWithSearch,
  searchOverrides: {
    // The plugin sets only create (off) and read (public). Its own sync bypasses access, so
    // these only gate the admin screens: staff may reindex (needs both) and set priority (#140).
    access: { update: isAdminOrEditor, delete: isAdminOrEditor },
    fields: ({ defaultFields }) => {
      return [...defaultFields, ...searchFields]
    },
  },
}
