import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'
import eslintConfigPrettier from 'eslint-config-prettier'

// FlatCompat bridge for eslint-config-next (still uses legacy format)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

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
      'src/migrations/**',
      'src/endpoints/seed/**',
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
      'unused-imports': unusedImports,
    },
    rules: {
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

      // ── Max file length ───────────────────────────────────────────────────
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],

      // ── General quality ───────────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  // ─── 5. Payload CMS overrides (hooks and collections use `any` in their API)
  {
    files: [
      'src/payload/**/*.ts',
      'src/collections/**/*.ts',
      'src/hooks/**/*.ts',
      'src/access/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ─── 6. Prettier must be last ────────────────────────────────────────────────
  eslintConfigPrettier,
]
