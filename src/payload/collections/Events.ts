import type { CollectionConfig } from 'payload'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'category', 'featured'],
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
      admin: {
        description: 'Auto-generated from title. Change only if needed.',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'timeStart', type: 'text', label: 'Start Time', admin: { width: '50%', placeholder: '6:00 PM' } },
        { name: 'timeEnd', type: 'text', label: 'End Time', admin: { width: '50%', placeholder: '8:00 PM' } },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'community',
      options: [
        { label: 'Government', value: 'government' },
        { label: 'Community', value: 'community' },
        { label: 'Social', value: 'social' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'locationType',
      type: 'select',
      required: true,
      defaultValue: 'in-person',
      options: [
        { label: 'In-Person', value: 'in-person' },
        { label: 'Virtual', value: 'virtual' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
    },
    {
      name: 'locationName',
      type: 'text',
      label: 'Venue Name',
    },
    {
      name: 'locationAddress',
      type: 'text',
      label: 'Street Address',
    },
    {
      name: 'locationCity',
      type: 'text',
      label: 'City',
      defaultValue: 'Madison',
    },
    {
      type: 'row',
      fields: [
        { name: 'mapsUrl', type: 'text', label: 'Google Maps URL', admin: { width: '50%' } },
        { name: 'registrationUrl', type: 'text', label: 'Registration URL', admin: { width: '50%' } },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: { description: '1–2 sentence summary shown in cards and feeds.' },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Full Details (optional)',
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
  ],
}
