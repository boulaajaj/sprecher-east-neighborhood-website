import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

/**
 * Unit tests: pure rules and guards, run in Node with no network and no database.
 * Test files sit next to the code they test as `*.test.ts`.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Same aliases as tsconfig.json. A string key matches "@" or "@/…", not "@payloadcms/…".
      '@': path.join(root, 'src'),
      '@payload-config': path.join(root, 'src/payload.config.ts'),
      // 'server-only' throws outside Next.js; tests load its empty build
      'server-only': path.join(root, 'node_modules/server-only/empty.js'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Every test starts clean: spies, stubbed env vars and stubbed globals are undone after each.
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
})
