import { describe, expect, it } from 'vitest'

import {
  isAdmin,
  isAdminFieldAccess,
  isAdminOrEditorBoolean,
  isAdminOrSelf,
} from '@/platform/payload/roles'

import { Users } from './users'

describe('Users', () => {
  it('uses the shared role checks for every operation', () => {
    expect(Users.access).toEqual({
      admin: isAdminOrEditorBoolean,
      create: isAdmin,
      delete: isAdmin,
      read: isAdminOrSelf,
      unlock: isAdmin,
      update: isAdminOrSelf,
    })
  })

  it('signs in with email and password, Payload’s defaults', () => {
    expect(Users.auth).toBe(true)
  })

  it('makes new accounts residents, and only admins may set a role', () => {
    const role = Users.fields.find((field) => 'name' in field && field.name === 'role')
    expect(role).toMatchObject({
      type: 'select',
      required: true,
      defaultValue: 'resident',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Resident', value: 'resident' },
      ],
      access: { create: isAdminFieldAccess, update: isAdminFieldAccess },
    })
  })
})
