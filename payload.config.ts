import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Events } from './src/payload/collections/Events'
import { Posts } from './src/payload/collections/Posts'
import { BoardMembers } from './src/payload/collections/BoardMembers'
import { Users } from './src/payload/collections/Users'
import { Media } from './src/payload/collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Events, Posts, BoardMembers, Users, Media],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? 'local-dev-secret-change-me-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI ?? 'file:./data/payload.db',
    },
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
})
