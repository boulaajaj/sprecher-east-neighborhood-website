#!/usr/bin/env node
// PreToolUse hook on Bash (#446): refuses the commands AGENTS.md forbids, before they run, and a
// commit whose `src/payload-types.ts` change is only `next dev` reformatting it. Exit 2
// blocks the command and shows Claude why. A real schema change to that file still commits.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { commitsAll, forbiddenReason, GENERATED_TYPES, isCommit } from './rules.mjs'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
const command = input?.tool_input?.command
if (typeof command !== 'string') process.exit(0)
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd()

const block = (reason) => {
  process.stderr.write(`Blocked: ${reason}\n`)
  process.exit(2)
}

const reason = forbiddenReason(command)
if (reason) block(reason)

const git = (...args) => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

// A bare `git push` while on main pushes main
if (/\bgit\s+push\s*($|;|&|\|)/.test(command) && git('branch', '--show-current') === 'main') {
  block('AGENTS.md: never push to main; work on a branch and open a pull request.')
}

if (isCommit(command)) {
  const staged = git('diff', '--cached', '--name-only').split('\n')
  const all = commitsAll(command)
  const unstaged = all ? git('diff', '--name-only').split('\n') : []
  if (staged.includes(GENERATED_TYPES) || unstaged.includes(GENERATED_TYPES)) {
    // What the commit would store: the index, or the working tree with `-a`
    const next = unstaged.includes(GENERATED_TYPES)
      ? readFileSync(path.join(root, GENERATED_TYPES), 'utf8')
      : git('show', `:${GENERATED_TYPES}`)
    const before = git('show', `HEAD:${GENERATED_TYPES}`)
    if (before && (await formattingOnly(before, next))) {
      block(
        `${GENERATED_TYPES} changed only in formatting: \`next dev\` rewrote it. Restore it ` +
          `(git checkout ${GENERATED_TYPES}); after a real schema change, \`npm run generate:types\`.`,
      )
    }
  }
}

/** Whether two versions of a TypeScript file differ only in formatting */
async function formattingOnly(a, b) {
  if (a === b) return false
  try {
    const prettier = await import(path.join(root, 'node_modules/prettier/index.mjs'))
    const options = {
      ...(await prettier.resolveConfig(path.join(root, GENERATED_TYPES))),
      parser: 'typescript',
    }
    return (await prettier.format(a, options)) === (await prettier.format(b, options))
  } catch {
    return false
  }
}
