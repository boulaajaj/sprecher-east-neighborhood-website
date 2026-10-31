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
    {
      name: 'defaultImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Shown on agent suggestions in this category until an editor picks another image. ' +
          'A subcategory without one uses its parent’s. Use a photo we own or may use, with ' +
          'its credit filled in.',
      },
    },
  ],
}
