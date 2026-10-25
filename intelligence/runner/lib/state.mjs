import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// What earlier runs saw, kept on the runtime's machine, never in the repo: each source's ETag,
// Last-Modified and cursor, and each item's last handled content hash (scout.md steps 2, 5, 7).
// An item counts as seen only once it was submitted, reported or rejected.

const EMPTY = { version: 1, sources: {}, seen: {} }

export function loadState(file) {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'))
    return { ...EMPTY, ...parsed, sources: parsed.sources ?? {}, seen: parsed.seen ?? {} }
  } catch (error) {
    if (error.code === 'ENOENT') return structuredClone(EMPTY)
    throw new Error(`State file ${file} is unreadable: ${error.message}`)
  }
}

/** Written to a temporary file first, so a crash never leaves half a state file. */
export function saveState(file, state) {
  mkdirSync(path.dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.tmp`
  writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`)
  renameSync(temporary, file)
}

/** `new`, `updated` (same ID, new hash) or `unchanged`, against what earlier runs handled. */
export function changeOf(state, externalId, hash) {
  const before = state.seen[externalId]
  if (before === undefined) return 'new'
  return before === hash ? 'unchanged' : 'updated'
}

export const markSeen = (state, externalId, hash) => {
  state.seen[externalId] = hash
}
