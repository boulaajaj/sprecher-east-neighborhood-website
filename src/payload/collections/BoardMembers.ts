import type { CollectionConfig } from 'payload'

export const BoardMembers: CollectionConfig = {
  slug: 'board-members',
  defaultSort: 'order',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => (user as any)?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      label: 'Board Role / Title',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio (optional)',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email (optional)',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: { description: 'Display order (lower = appears first).' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
