// What both hooks share (#446): reading the hook's JSON input, finding the repository a path
// belongs to, and running a tool from that repository's node_modules without a shell.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/** The hook input, or null when stdin isn't JSON (then the hook does nothing) */
export function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || 'null')
  } catch {
    return null
  }
}

/** Runs git in `cwd`; '' when git fails (not a repository, no such ref) */
export function git(cwd, ...args) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

/** The top of the git checkout or worktree that holds `dir`, or null */
export function repoRoot(dir) {
  return git(dir, 'rev-parse', '--show-toplevel') || null
}

/** Where each tool's command-line script sits inside node_modules */
const BINS = {
  prettier: 'node_modules/prettier/bin/prettier.cjs',
  eslint: 'node_modules/eslint/bin/eslint.js',
}

/** Runs a tool from `root`'s node_modules with Node, or returns null when it isn't installed */
export function runTool(root, tool, args) {
  const bin = path.join(root, BINS[tool])
  if (!existsSync(bin)) return null
  return spawnSync(process.execPath, [bin, ...args], { cwd: root, encoding: 'utf8' })
}
