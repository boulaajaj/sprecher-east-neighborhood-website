import type { CollectionConfig } from 'payload'

import { ROLES } from '@/platform/lib'
import {
  isAdmin,
  isAdminFieldAccess,
  isAdminOrEditorBoolean,
  isAdminOrSelf,
} from '@/platform/payload/roles'

import { requireCurrentPassword } from './requireCurrentPassword'

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
  auth: {
    cookies: {
      // Secure in production, so browsers send the sign-in cookie over HTTPS only (#234). Decided
      // by NODE_ENV rather than the server URL: a production build is secure even if the URL is
      // misconfigured as http, while `next dev` on http://localhost still signs in. Signing in
      // over plain http in production (the IP on port 80) stops working, on purpose.
      secure: process.env.NODE_ENV === 'production',
    },
  },
  hooks: {
    // Your own password changes only on /account, after your current one is checked (#233)
    beforeChange: [requireCurrentPassword],
  },
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
