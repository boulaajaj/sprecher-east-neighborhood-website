import type { CollectionAfterReadHook } from 'payload'
import type { User } from '@/payload-types'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req }) => {
  if (doc?.authors && doc?.authors?.length > 0) {
    const authorDocs = (
      await Promise.all(
        doc.authors.map(async (author: User | User['id']) => {
          try {
            return await req.payload.findByID({
              id: typeof author === 'object' ? author?.id : author,
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
    ).filter(Boolean) as User[]

    if (authorDocs.length > 0) {
      doc.populatedAuthors = authorDocs.map((authorDoc) => ({
        id: authorDoc.id,
        name: authorDoc.name,
      }))
    }
  }

  return doc
}
