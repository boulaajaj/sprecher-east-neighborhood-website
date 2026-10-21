// Copies the live SQLite database to a new file and checks the copy (#148).
//
// Usage: node ops/backup-db.mjs <source.db> <destination.db>
//
// `VACUUM INTO` writes a consistent copy while the site keeps running, so the app never has to
// stop. It reads under a shared lock: if the app is in the middle of a write, it waits up to 15 s
// for it to finish instead of failing at once. Works in rollback-journal and WAL mode alike, and
// the copy is a single file either way. Uses the same SQLite client as Payload's adapter.
import { existsSync } from 'node:fs'
import { createClient } from '@libsql/client'

const [source, destination] = process.argv.slice(2)
if (!source || !destination) {
  console.error('usage: node ops/backup-db.mjs <source.db> <destination.db>')
  process.exit(2)
}
if (!existsSync(source)) {
  console.error(`[backup] database not found: ${source}`)
  process.exit(1)
}
if (existsSync(destination)) {
  console.error(`[backup] refusing to overwrite: ${destination}`)
  process.exit(1)
}

const live = createClient({ url: `file:${source}` })
try {
  await live.execute('PRAGMA busy_timeout = 15000')
  await live.execute({ sql: 'VACUUM INTO ?', args: [destination] })
} finally {
  live.close()
}

const copy = createClient({ url: `file:${destination}` })
try {
  const result = await copy.execute('PRAGMA integrity_check')
  const verdict = String(result.rows[0]?.[0] ?? '')
  if (verdict !== 'ok') {
    console.error(`[backup] integrity check failed: ${verdict}`)
    process.exit(1)
  }
} finally {
  copy.close()
}
