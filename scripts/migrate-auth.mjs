/**
 * Run Better Auth database migrations to create auth.db schema.
 * Usage: node scripts/migrate-auth.mjs
 */
import { getMigrations } from 'better-auth/db'
import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '..', 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const auth = betterAuth({
  database: new Database(path.join(dataDir, 'auth.db')),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  socialProviders: {
    google: { clientId: 'placeholder', clientSecret: 'placeholder' },
    github: { clientId: 'placeholder', clientSecret: 'placeholder' },
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'resident', input: false },
    },
  },
  secret: 'migration-secret',
  baseURL: 'http://localhost:3000',
})

console.log('Running Better Auth migrations...')
const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(auth.options)

console.log(`Tables to create: ${toBeCreated.map(t => t.table).join(', ') || '(none)'}`)
console.log(`Fields to add: ${toBeAdded.length > 0 ? toBeAdded.map(t => t.table).join(', ') : '(none)'}`)

await runMigrations()
console.log('✓ Auth DB migrations complete!')
