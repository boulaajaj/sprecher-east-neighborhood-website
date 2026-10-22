import type { CollectionConfig } from 'payload'

import { draftContentAccess } from '@/platform/payload/draftContentAccess'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'

import { RESOURCE_CATEGORIES } from '../domain/categories'
import { isResourceUrl } from '../domain/resourceUrl'
import { revalidateListPage } from './revalidateListPage'

const revalidate = revalidateListPage('resources')

export const Resources: CollectionConfig<'resources'> = {
  slug: 'resources',
  defaultSort: 'order',
  access: draftContentAccess,
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
      validate: (value: string | null | undefined) =>
        !value || isResourceUrl(value) || 'Must be a valid URL starting with http:// or https://',
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
      options: [...RESOURCE_CATEGORIES],
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
    afterChange: [revalidate.afterChange],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidate.afterDelete],
  },
  versions: {
    drafts: true,
  },
}
