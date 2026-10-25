import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// What earlier runs saw, kept on the runtime's machine, never in the repo: each source's ETag,
// Last-Modified and cursor, and each item's last handled content hash (scout.md steps 2, 5, 7).
// An item counts as seen only once it was submitted, reported or rejected.

const EMPTY = { version: 1, sources: {}, seen: {} }

export function loadState(file) {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'))
    // Entries from before dates were kept start their 180 days now
    const now = new Date().toISOString()
    const seen = Object.fromEntries(
      Object.entries(parsed.seen ?? {}).map(([id, entry]) => [
        id,
        typeof entry === 'string' ? { hash: entry, at: now } : entry,
      ]),
    )
    return { ...EMPTY, ...parsed, sources: parsed.sources ?? {}, seen }
  } catch (error) {
    if (error.code === 'ENOENT') return structuredClone(EMPTY)
    throw new Error(`State file ${file} is unreadable: ${error.message}`)
  }
}

/** How long an item stays remembered after it was last handled. */
export const KEEP_SEEN_DAYS = 180

/** Forgets items not handled for `KEEP_SEEN_DAYS`, so the file doesn't grow forever. */
export function pruneSeen(state, now = new Date()) {
  const cutoff = new Date(now.getTime() - KEEP_SEEN_DAYS * 86_400_000).toISOString()
  state.seen = Object.fromEntries(
    Object.entries(state.seen).filter(
      ([, entry]) => typeof entry !== 'object' || entry === null || entry.at >= cutoff,
    ),
  )
}

/** Written to a temporary file first, so a crash never leaves half a state file. */
export function saveState(file, state) {
  pruneSeen(state)
  mkdirSync(path.dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.tmp`
  writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`)
  renameSync(temporary, file)
}

/** `new`, `updated` (same ID, new hash) or `unchanged`, against what earlier runs handled. */
export function changeOf(state, externalId, hash) {
  const before = state.seen[externalId]
  if (before === undefined) return 'new'
  const seenHash = typeof before === 'string' ? before : before?.hash
  return seenHash === hash ? 'unchanged' : 'updated'
}

export const markSeen = (state, externalId, hash, now = new Date()) => {
  state.seen[externalId] = { hash, at: now.toISOString() }
}
