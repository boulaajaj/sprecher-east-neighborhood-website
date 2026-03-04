import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin, isAdminOrEditor } from '../access/roles'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
