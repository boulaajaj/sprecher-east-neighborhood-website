import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidateDelete, revalidateResource } from './hooks/revalidateResource'

export const Resources: CollectionConfig = {
  slug: 'resources',
  defaultSort: 'order',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'category', 'order', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'url',
      type: 'text',
      admin: { placeholder: 'https://...' },
      validate: (value: string | null | undefined) => {
        if (value && !/^https?:\/\//.test(value)) {
          return 'Must be a valid URL starting with http:// or https://'
        }
        return true
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: { placeholder: '(608) 555-0100' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Elected Officials', value: 'elected-officials' },
        { label: 'Public Safety', value: 'public-safety' },
        { label: 'Childcare & Education', value: 'childcare' },
        { label: 'Renting & Housing', value: 'renting' },
        { label: 'Parks & Recreation', value: 'parks' },
        { label: 'Community Organizations', value: 'community' },
        { label: 'Utilities & Services', value: 'utilities' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within category',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateResource],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: true,
  },
}
