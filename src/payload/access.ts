import type { Access } from 'payload'

/**
 * Shared read access for collections with a `contentStatus` field.
 *
 * - Authenticated users (editors/admins) can read all documents.
 * - Anonymous users can only read documents with `contentStatus: 'published'`.
 *
 * Use this on any collection that has a contentStatus workflow field.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    contentStatus: {
      equals: 'published',
    },
  }
}
