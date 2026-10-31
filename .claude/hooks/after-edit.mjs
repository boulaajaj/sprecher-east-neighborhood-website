#!/usr/bin/env node
// PostToolUse hook on Edit, Write and MultiEdit (#446): formats the file Claude just changed and
// lints it, the same commands lint-staged runs at commit time, in the checkout (or worktree) that
// holds the file. A lint error goes back to Claude (exit 2) so it fixes it now, not at the commit.
// It never undoes the edit, and it does nothing before `npm install`.
import path from 'node:path'

import { readInput, repoRoot, runTool } from './io.mjs'
import { shouldFormat, shouldLint } from './rules.mjs'

const input = readInput()
const file = input?.tool_input?.file_path
if (typeof file !== 'string' || !file) process.exit(0)

const absolute = path.resolve(input.cwd || process.cwd(), file)
const root = repoRoot(path.dirname(absolute))
if (!root) process.exit(0)
const relative = path.relative(root, absolute)
if (relative.startsWith('..') || relative.split(path.sep).includes('node_modules')) process.exit(0)

if (shouldFormat(relative)) runTool(root, 'prettier', ['--write', '--ignore-unknown', relative])

if (shouldLint(relative)) {
  const lint = runTool(root, 'eslint', ['--fix', '--no-warn-ignored', relative])
  if (lint && lint.status !== 0) {
    process.stderr.write(
      `ESLint found problems in ${relative}; fix them now:\n${lint.stdout}${lint.stderr}`,
    )
    process.exit(2)
  }
}
