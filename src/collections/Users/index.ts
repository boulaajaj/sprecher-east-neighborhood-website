import type { CollectionConfig } from 'payload'

import {
  ROLES,
  isAdmin,
  isAdminOrEditorBoolean,
  isAdminOrSelf,
  isAdminFieldAccess,
} from '@/platform/payload/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: isAdminOrEditorBoolean,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    // Payload's default lets any account unlock any other, undoing the login lockout (#140)
    unlock: isAdmin,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: ROLES.resident,
      options: [
        { label: 'Admin', value: ROLES.admin },
        { label: 'Editor', value: ROLES.editor },
        { label: 'Resident', value: ROLES.resident },
      ],
      access: {
        create: isAdminFieldAccess,
        update: isAdminFieldAccess,
        read: () => true,
      },
      admin: {
        position: 'sidebar',
        description: 'Controls access level. Only admins can change roles.',
      },
    },
  ],
  timestamps: true,
}
