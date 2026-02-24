import path from 'path'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve('./public/media'),
    imageSizes: [
      { name: 'card', width: 800, height: 500, position: 'centre' },
      { name: 'thumbnail', width: 400, height: 250, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
    },
  ],
}
