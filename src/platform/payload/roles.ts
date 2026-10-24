import type { Access, AccessArgs, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

import { ROLES, type Role } from '../lib/roles'

/**
 * Extract role from the request user.
 * Returns 'resident' as the safe default if no role is set (e.g., pre-migration users).
 */
const getRole = (user: User | null): Role | null => {
  if (!user) return null
  return user.role || ROLES.resident
}

/** Check if user has admin role (also used by routes that only admins may call) */
export const hasAdmin = (user: User | null): boolean => getRole(user) === ROLES.admin

/** Whether a role is staff (admin or editor). Takes any value, so untyped data can be checked */
export const isStaffRole = (role: unknown): boolean => role === ROLES.admin || role === ROLES.editor

/** Check if user has admin or editor role (also used by hooks that exempt staff) */
export const hasAdminOrEditor = (user: User | null): boolean => isStaffRole(getRole(user))

/** Admin only — full access to everything */
export const isAdmin: Access = ({ req: { user } }) => hasAdmin(user)

/** Admin or editor — content management access */
export const isAdminOrEditor: Access = ({ req: { user } }) => hasAdminOrEditor(user)

/**
 * Admin or editor — for the `admin` collection access field.
 * Payload's `admin` property requires `boolean` return (not `Where`),
 * so this uses a narrower type signature than `Access`.
 */
export const isAdminOrEditorBoolean = ({ req: { user } }: AccessArgs): boolean =>
  hasAdminOrEditor(user)

/** Admin sees all records; non-admins see only their own record (by id match) */
export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if (hasAdmin(user)) return true
  if (!id) return false
  return user.id === id
}

/** Admin only, as a plain boolean: for access hooks that can't take a query filter (jobs). */
export const isAdminBoolean = ({ req: { user } }: AccessArgs): boolean => hasAdmin(user)

/**
 * Field-level: only admins can create/update.
 * Same logic as isAdmin but typed as FieldAccess (Payload requires a different signature).
 */
export const isAdminFieldAccess: FieldAccess = ({ req: { user } }) => hasAdmin(user)

/**
 * Field-level: only admins and editors can read.
 * Used to hide internal fields (e.g. form email routing) on publicly readable documents.
 */
export const isAdminOrEditorFieldAccess: FieldAccess = ({ req: { user } }) => hasAdminOrEditor(user)

const nobody: FieldAccess = () => false

/**
 * Field-level: no one, through any API. For a field only the server sets: `hidden: true` hides it
 * from reads only, and Payload still accepts writes to it (#299). The server writes it with
 * `overrideAccess: true` or the database adapter, which skip field access.
 */
export const serverOnlyFieldAccess = { create: nobody, read: nobody, update: nobody }
