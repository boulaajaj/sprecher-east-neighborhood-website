import type { Access, AccessArgs, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

/** Role constants — single source of truth for role string values */
export const ROLES = {
  admin: 'admin',
  editor: 'editor',
  resident: 'resident',
} as const

/** Derived from the User type's role field — stays in sync with payload-types automatically */
type UserRole = User['role']

/**
 * Extract role from the request user.
 * Returns 'resident' as the safe default if no role is set (e.g., pre-migration users).
 */
const getRole = (user: User | null): UserRole | null => {
  if (!user) return null
  return user.role || ROLES.resident
}

/** Check if user has admin role */
const hasAdmin = (user: User | null): boolean => getRole(user) === ROLES.admin

/** Check if user has admin or editor role */
const hasAdminOrEditor = (user: User | null): boolean => {
  const role = getRole(user)
  return role === ROLES.admin || role === ROLES.editor
}

/** Admin only — full access to everything */
export const isAdmin: Access = ({ req: { user } }) => hasAdmin(user as User | null)

/** Admin or editor — content management access */
export const isAdminOrEditor: Access = ({ req: { user } }) => hasAdminOrEditor(user as User | null)

/**
 * Admin or editor — for the `admin` collection access field.
 * Payload's `admin` property requires `boolean` return (not `Where`),
 * so this uses a narrower type signature than `Access`.
 */
export const isAdminOrEditorBoolean = ({ req: { user } }: AccessArgs): boolean =>
  hasAdminOrEditor(user as User | null)

/** Admin sees all records; non-admins see only their own record (by id match) */
export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  const typedUser = user as User | null
  if (!typedUser) return false
  if (hasAdmin(typedUser)) return true
  if (!id) return false
  return typedUser.id === id
}

/**
 * Field-level: only admins can create/update.
 * Same logic as isAdmin but typed as FieldAccess (Payload requires a different signature).
 */
export const isAdminFieldAccess: FieldAccess = ({ req: { user } }) => hasAdmin(user as User | null)
