import type { CollectionConfig } from 'payload'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'category', 'featured'],
  },
  access: {
    read: () => true,
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
      admin: { description: 'Auto-generated from title.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      type: 'row',
      fields: [
        { name: 'author', type: 'text', defaultValue: 'Sprecher East', admin: { width: '50%' } },
        {
          name: 'category',
          type: 'select',
          defaultValue: 'announcement',
          admin: { width: '50%' },
          options: [
            { label: 'Announcement', value: 'announcement' },
            { label: 'Government', value: 'government' },
            { label: 'Community', value: 'community' },
            { label: 'About Sprecher East', value: 'about-sena' },
          ],
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: { description: 'Short summary shown in feeds and cards.' },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Post Content',
    },
  ],
}
