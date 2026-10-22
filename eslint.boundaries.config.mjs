// The architecture's dependency rules as lint (docs/architecture/README.md#dependency-rules).
// Warnings for now, so nothing breaks while code moves out of the template folders (#127);
// #137 turns them into errors once it has.
import boundaries from 'eslint-plugin-boundaries'

// A module's entry files: the only files code outside the module may import (rule 2)
const ENTRY_FILES = '{index,server,actions,cms}.ts'

// The Payload website template's folders, until their code moves to src/modules/ and src/platform/
const TEMPLATE_FOLDERS = [
  'access',
  'blocks',
  'collections',
  'components',
  'endpoints',
  'fields',
  'Footer',
  'Header',
  'heros',
  'hooks',
  'plugins',
  'providers',
  'search',
  'utilities',
]

// Runtime Payload: the framework, its packages and the config (rule 6). `import type` is fine.
const PAYLOAD = [
  { to: { module: { source: ['payload', '@payloadcms/*'] } }, dependency: { kind: 'value' } },
  { dependency: { source: '@payload-config', kind: 'value' } },
]

// Pages and routes that still query Payload themselves. Each leaves this list when its area moves
// to a module (#131 to #136); any other file in src/app/ that does it gets a warning.
const STILL_QUERYING_PAYLOAD = [
  '(frontend)/[slug]/page.tsx',
  '(frontend)/events/[slug]/page.tsx',
  '(frontend)/faq/page.tsx',
  '(frontend)/next/preview/route.ts',
  '(frontend)/next/seed/route.ts',
  '(frontend)/posts/[slug]/page.tsx',
  '(frontend)/posts/page/[pageNumber]/page.tsx',
  '(frontend)/resources/page.tsx',
  '(frontend)/search/page.tsx',
  '(frontend)/(sitemaps)/events-sitemap.xml/route.ts',
  '(frontend)/(sitemaps)/pages-sitemap.xml/route.ts',
  '(frontend)/(sitemaps)/posts-sitemap.xml/route.ts',
].map((file) => `src/app/${file}`.replace(/[\\()[\]{}*?!+@]/g, '\\$&')) // escape glob characters

// Inside a module, what each part must not import from the same module (rules 1, 4 and 5).
// Entry files never import each other; inner folders import folders, not entry files.
const LAYER_LIMITS = [
  ['domain/**', ['{use-cases,data,cms,ui}/**', ENTRY_FILES], 'domain/ imports no other layer'],
  ['use-cases/**', ['{cms,ui}/**', ENTRY_FILES], 'use-cases/ imports only domain/ and data/'],
  ['data/**', ['{use-cases,cms,ui}/**', ENTRY_FILES], 'data/ imports only domain/'],
  [
    'cms/**',
    ['{use-cases,data,ui}/**', ENTRY_FILES],
    'cms/ imports only domain/ (no server-only code)',
  ],
  [
    'ui/**',
    ['{data,cms}/**', '{index,server,cms}.ts'],
    'ui/ imports only domain/, use-cases/ and actions.ts',
  ],
  [
    'index.ts',
    ['{use-cases,data,cms}/**', '{server,actions,cms}.ts'],
    'index.ts stays client-safe: domain/ and ui/ only',
  ],
  [
    'server.ts',
    ['{data,cms}/**', '{index,actions,cms}.ts'],
    'server.ts exports domain/, use-cases/ and ui/ only',
  ],
  [
    'cms.ts',
    ['{use-cases,data,ui}/**', '{index,server,actions}.ts'],
    'cms.ts exports cms/ and domain/ only',
  ],
  [
    'actions.ts',
    ['{cms,ui}/**', '{index,server,cms}.ts'],
    'actions.ts calls use cases, not ui/ or cms/',
  ],
]

const rule = (number) => `docs/architecture/README.md rule ${number}`

export const boundariesConfig = {
  files: ['src/**/*.{ts,tsx}'],
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app', partialMatch: false },
      { type: 'module', pattern: 'src/modules/*', partialMatch: false, capture: ['module'] },
      { type: 'platform', pattern: 'src/platform', partialMatch: false },
      {
        type: 'template',
        pattern: TEMPLATE_FOLDERS.map((folder) => `src/${folder}`),
        partialMatch: false,
      },
    ],
    'boundaries/files': [
      // Root files (payload.config.ts, proxy.ts) belong to no element; this makes them checked
      { pattern: 'src/*.ts', category: 'root' },
      { pattern: STILL_QUERYING_PAYLOAD, category: 'still-querying-payload' },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      'warn',
      {
        // Only these policies apply; the template folders stay unchecked until they move
        default: 'allow',
        checkAllOrigins: true,
        checkUnknownLocals: true,
        checkInternals: true,
        policies: [
          {
            disallow: { to: { element: { type: 'module', fileInternalPath: `!${ENTRY_FILES}` } } },
            message: `Import a module only through its entry files (${rule(2)})`,
          },
          {
            from: { element: { type: 'app' } },
            disallow: { to: { element: { type: 'module', fileInternalPath: 'cms.ts' } } },
            message: `Only payload.config.ts imports a module's cms.ts (${rule(2)})`,
          },
          {
            from: { element: { type: ['module', 'platform'] } },
            disallow: { to: { element: { type: ['module', 'app'] } } },
            message: `No module imports another, and platform/ imports none: compose them in src/app/ or payload.config.ts (${rule(3)})`,
          },
          // A module's own files may import each other; the layer limits below narrow this
          { allow: { dependency: { relationship: { to: 'internal' } } } },
          ...LAYER_LIMITS.map(([from, to, why]) => ({
            from: { element: { type: 'module', fileInternalPath: from } },
            disallow: {
              to: { element: { type: 'module', fileInternalPath: to } },
              dependency: { relationship: { to: 'internal' } },
            },
            message: `${why} (${rule(1)})`,
          })),
          {
            from: [
              { element: { type: 'app' } },
              { element: { type: 'module', fileInternalPath: '!{data/**,cms/**,cms.ts}' } },
            ],
            disallow: PAYLOAD,
            message: `Runtime Payload only in a module's data/ or cms/ (${rule(6)})`,
          },
          { from: { file: { categories: 'still-querying-payload' } }, allow: PAYLOAD },
          {
            from: { element: { type: 'module', fileInternalPath: 'domain/**' } },
            disallow: {
              to: {
                module: {
                  source: ['next', 'react', 'react-dom', 'payload', '@payloadcms/*'],
                },
              },
              dependency: { kind: 'value' },
            },
            message: `The domain imports no framework (${rule(1)})`,
          },
          {
            from: { element: { type: 'module', fileInternalPath: 'domain/**' } },
            disallow: { to: { element: { type: 'platform', fileInternalPath: '!lib/**' } } },
            message: `The domain may use only platform/lib/ (${rule(1)})`,
          },
        ],
      },
    ],
  },
}
