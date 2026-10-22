/**
 * The roles an account can have (glossary: People and roles). One list for the users collection,
 * the role checks in `platform/payload/roles.ts` and any module that needs a role as a type.
 */
export const ROLES = {
  admin: 'admin',
  editor: 'editor',
  resident: 'resident',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
