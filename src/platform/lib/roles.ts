/**
 * The roles an account can have (glossary: People and roles). One list for the users collection,
 * the role checks in `platform/payload/roles.ts` and any module that needs a role as a type.
 */
export const ROLES = {
  admin: 'admin',
  editor: 'editor',
  resident: 'resident',
  agent: 'agent',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/**
 * The collection whose documents are accounts with a role. Role checks trust only principals from
 * it: an MCP API key can also authenticate a request as the key document itself (#336).
 */
export const ACCOUNTS_COLLECTION = 'users'
