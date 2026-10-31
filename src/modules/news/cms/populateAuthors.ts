import type { CollectionAfterReadHook } from 'payload'

import type { Post } from '@/payload-types'

/**
 * Users are private, so a post can't show its authors by loading them as a visitor. This hook
 * copies each author's name into `populatedAuthors`, a field hidden from the admin UI. (GraphQL
 * won't return mutated user data that differs from the schema, hence a separate field.)
 */
export const populateAuthors: CollectionAfterReadHook<Post> = async ({ doc, req }) => {
  if (!doc?.authors || doc.authors.length === 0) return doc

  const authorDocs = await Promise.all(
    doc.authors.map(async (author) => {
      try {
        return await req.payload.findByID({
          id: typeof author === 'object' ? author.id : author,
          collection: 'users',
          depth: 0,
          // Users are private; this reads only the name, which posts show publicly
          select: { name: true },
          overrideAccess: true,
          // A missing author returns null instead of throwing inside the post's request
          disableErrors: true,
          req,
        })
      } catch {
        return null
      }
    }),
  )

  const found = authorDocs.flatMap((authorDoc) => (authorDoc ? [authorDoc] : []))
  if (found.length > 0) {
    doc.populatedAuthors = found.map(({ id, name }) => ({ id: String(id), name }))
  }

  return doc
}
