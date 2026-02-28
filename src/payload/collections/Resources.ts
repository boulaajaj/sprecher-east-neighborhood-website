import type { CollectionConfig } from 'payload'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'contentStatus'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => (user as any)?.role === 'admin',
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
      required: true,
      admin: { description: 'Brief description of this resource.' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'External URL for this resource.' },
    },
    {
      name: 'phone',
      type: 'text',
      admin: { description: 'Contact phone number (optional).' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'other',
      options: [
        { label: 'Elected Officials', value: 'elected-officials' },
        { label: 'Public Safety', value: 'public-safety' },
        { label: 'Childcare', value: 'childcare' },
        { label: 'Renting', value: 'renting' },
        { label: 'Other Community Resources', value: 'other' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: { description: 'Display order within category (lower = first).' },
    },
    {
      name: 'contentStatus',
      type: 'select',
      label: 'Status',
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
