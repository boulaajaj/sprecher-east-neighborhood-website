import type { CollectionConfig, TextFieldSingleValidation } from 'payload'
import { text } from 'payload/shared'

import { draftContentAccess } from '@/platform/payload/draftContentAccess'
import { populatePublishedAt } from '@/platform/payload/populatePublishedAt'

import { RESOURCE_CATEGORIES } from '../domain/categories'
import { checkPhotoCredit, checkResourceUrl, PORTRAIT_CATEGORY } from '../domain/resourcePortrait'
import { revalidateListPage } from './revalidateListPage'

const revalidate = revalidateListPage('resources')

// A link row's URL is required: Payload's own text check (required, maxLength) runs first, then
// the web-address check, so a row can't save with only a label
const validateLinkUrl: TextFieldSingleValidation = (value, args) => {
  const native = text(value, args)
  return native === true ? checkResourceUrl(value) : native
}

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
      validate: checkResourceUrl,
    },
    {
      name: 'links',
      type: 'array',
      label: 'More links',
      labels: { singular: 'Link', plural: 'Links' },
      maxRows: 3,
      admin: {
        description:
          'Up to three more links shown on the card, for example "Alder blog". "Visit Website" above stays the main link.',
      },
      fields: [
        { name: 'label', type: 'text', required: true, maxLength: 60 },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
          maxLength: 2048,
          admin: { placeholder: 'https://...' },
          validate: validateLinkUrl,
        },
      ],
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
      type: 'collapsible',
      label: 'Portrait',
      // Officials only, and only with their permission (#393). Payload skips validating hidden
      // fields, and the card shows no photo outside this category either
      admin: {
        condition: (data) => data?.category === PORTRAIT_CATEGORY,
        description:
          'The official’s portrait. Add one only with their written permission, and link that permission on the issue.',
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          // A portrait is an image: the media library also holds PDFs and videos, which the
          // card can't draw as one. Payload applies this when choosing and when saving
          filterOptions: { mimeType: { contains: 'image/' } },
        },
        {
          name: 'photoCredit',
          type: 'text',
          label: 'Photo credit',
          maxLength: 200,
          admin: {
            description:
              'Required with a photo. Shown as "Photo: …", so leave out "Photo:", for example "City of Madison, Alder Sean O’Brien".',
          },
          validate: (value: string | null | undefined, { siblingData }: { siblingData: unknown }) =>
            checkPhotoCredit(value, (siblingData as { photo?: unknown } | undefined)?.photo),
        },
        {
          name: 'photoSourceUrl',
          type: 'text',
          label: 'Photo source link',
          maxLength: 2048,
          admin: {
            placeholder: 'https://...',
            description: 'Optional: the page the photo came from. The credit links to it.',
          },
          validate: checkResourceUrl,
        },
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
    afterChange: [revalidate.afterChange],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidate.afterDelete],
  },
  versions: {
    drafts: true,
  },
}
