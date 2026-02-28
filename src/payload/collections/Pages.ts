import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '../access'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'contentStatus', 'updatedAt'],
  },
  access: {
    read: publishedOrAuthenticated,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => (user as any)?.role === 'admin',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data.slug) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL path for this page.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short description for SEO and page headers.' },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Page Content',
    },
    {
      name: 'contentStatus',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
