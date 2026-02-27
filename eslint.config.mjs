import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import checkFile from 'eslint-plugin-check-file'
import unusedImports from 'eslint-plugin-unused-imports'
import eslintConfigPrettier from 'eslint-config-prettier'

// FlatCompat bridge for eslint-config-next (still uses legacy format)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

// ─── DDD Architectural Zones ─────────────────────────────────────────────────
//
//   Level 1: ui/        → Atomic, domain-agnostic primitives (used app-wide)
//   Level 2: features/  → Domain-specific components (events/, posts/)
//   Level 3: sections/  → Full-page sections composed from features + ui
//   Shell:   layout/    → App shell (Nav, Footer, UserMenu)
//
//   Import rules enforced by eslint-plugin-boundaries:
//     ui/       → can import from lib/ only (utilities, types)
//     features/ → can import from ui/ and lib/
//     sections/ → can import from ui/, features/, and lib/
//     layout/   → can import from ui/, layout/ (Nav→UserMenu), and lib/
//     app/      → can import from everything (composition root)
//     lib/      → can import from other lib/ files only
//
const BOUNDARY_ELEMENTS = [
  { type: 'ui', pattern: 'src/components/ui/*', mode: 'file' },
  {
    type: 'feature',
    pattern: 'src/components/features/**/*',
    mode: 'file',
    capture: ['domain', 'name'],
  },
  { type: 'section', pattern: 'src/components/sections/*', mode: 'file' },
  { type: 'layout', pattern: 'src/components/layout/*', mode: 'file' },
  { type: 'app', pattern: 'src/app/**/*', mode: 'file' },
  { type: 'lib', pattern: 'src/lib/**/*', mode: 'file' },
]

export default [
  // ─── 1. Global ignores ───────────────────────────────────────────────────────
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'data/**',
      '_legacy/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'next-env.d.ts',
      'src/app/(payload)/**',
      'scripts/**',
      '.eslintcache',
    ],
  },

  // ─── 2. Next.js recommended rules (via FlatCompat bridge) ────────────────────
  ...compat.extends('next/core-web-vitals'),

  // ─── 3. TypeScript strict rules ──────────────────────────────────────────────
  ...tseslint.configs.strict,

  // ─── 4. Main rules ──────────────────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      boundaries,
      'check-file': checkFile,
      'unused-imports': unusedImports,
    },
    settings: {
      'boundaries/elements': BOUNDARY_ELEMENTS,
      'boundaries/include': ['src/**/*'],
    },
    rules: {
      // ── DDD Architectural boundary enforcement ────────────────────────────
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // ui/ can import from lib/ (shared utilities like cn(), types)
            { from: 'ui', allow: ['lib'] },
            // features/ can import from ui/ and lib/
            { from: 'feature', allow: ['ui', 'lib'] },
            // sections/ can import from ui/, features/, and lib/
            { from: 'section', allow: ['ui', 'feature', 'lib'] },
            // layout/ can import from ui/, other layout/ files, and lib/
            { from: 'layout', allow: ['ui', 'layout', 'lib'] },
            // app/ pages can import from everything including other app/ files
            { from: 'app', allow: ['ui', 'feature', 'section', 'layout', 'lib', 'app'] },
            // lib/ can import from other lib/ files
            { from: 'lib', allow: ['lib'] },
          ],
        },
      ],

      // ── Unused imports (auto-fixable) ─────────────────────────────────────
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unused-vars': 'off',

      // ── TypeScript strict ─────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // ── React best practices ──────────────────────────────────────────────
      'react/self-closing-comp': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      // Disable — modern React handles apostrophes/quotes in JSX fine
      'react/no-unescaped-entities': 'off',

      // ── File naming conventions ────────────────────────────────────────────
      // kebab-case for ui/, features/, sections/, lib/
      // layout/ uses PascalCase (React component convention for app shell)
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/components/ui/**/*.{ts,tsx}': 'KEBAB_CASE',
          'src/components/features/**/*.{ts,tsx}': 'KEBAB_CASE',
          'src/components/sections/**/*.{ts,tsx}': 'KEBAB_CASE',
          'src/lib/**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],

      // ── Max file length ───────────────────────────────────────────────────
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],

      // ── General quality ───────────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  // ─── 5. Payload CMS overrides (hooks use `any` in their API) ──────────────
  {
    files: ['src/payload/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ─── 6. Prettier must be last ────────────────────────────────────────────────
  eslintConfigPrettier,
]
