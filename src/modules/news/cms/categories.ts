import { slugField, type CollectionConfig } from 'payload'

import { anyone } from '@/platform/payload/anyone'
import { isAdmin, isAdminOrEditor } from '@/platform/payload/roles'

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
