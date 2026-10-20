import { sqliteAdapter } from '@payloadcms/db-sqlite'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { TeamMembers } from './collections/TeamMembers'
import { Categories } from './collections/Categories'
import { Events } from './collections/Events'
import { FAQ } from './collections/FAQ'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Resources } from './collections/Resources'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { isAdminBoolean, isAdminOrEditor, isAdminOrEditorBoolean } from './access/roles'
import { getServerSideURL } from './utilities/getURL'
import { emailAdapterFromEnv } from './utilities/email'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: defaultLexical,
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI ?? 'file:./data/payload.db',
    },
  }),
  collections: [Pages, Posts, Events, TeamMembers, Resources, FAQ, Media, Categories, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  folders: {
    // Media folders are staff-only: Payload's default would let any signed-in account create,
    // rename or delete them through the API (#140).
    collectionOverrides: [
      ({ collection }) => ({
        ...collection,
        access: {
          ...collection.access,
          read: isAdminOrEditor,
          readVersions: isAdminOrEditor,
          create: isAdminOrEditor,
          update: isAdminOrEditor,
          delete: isAdminOrEditor,
        },
      }),
    ],
  },
  // SMTP (Mailgun in production); unset → emails go to the server log
  email: emailAdapterFromEnv(),
  jobs: {
    // Payload's default lets any signed-in account run, queue or cancel jobs (#140). Editors
    // queue and cancel scheduled publishes from Admin; only admins may run the queue by hand.
    access: { cancel: isAdminOrEditorBoolean, queue: isAdminOrEditorBoolean, run: isAdminBoolean },
  },
  // Absolute links in emails (password reset). Without it Payload derives the origin from the
  // request and, behind the Caddy proxy (http upstream vs https allowlist), falls back to a
  // relative link that doesn't work in an email.
  serverURL: getServerSideURL(),
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    // Regenerate types only under `next dev`. Payload otherwise rewrites this file whenever
    // NODE_ENV isn't 'production' — including `payload migrate` in the deploy — which left the
    // server checkout dirty and can make the next deploy's `git pull` fail (#115).
    // After schema changes, run `npm run generate:types`.
    autoGenerate: process.env.NODE_ENV === 'development',
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
