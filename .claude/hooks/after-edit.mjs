#!/usr/bin/env node
// PostToolUse hook on Edit, Write and MultiEdit (#446): formats the file Claude just changed and
// lints it, the same commands lint-staged runs at commit time. A lint error goes back to Claude
// (exit 2) so it fixes it now, not at the commit. It never undoes the edit.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { shouldFormat, shouldLint } from './rules.mjs'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const file = input?.tool_input?.file_path
if (!file) process.exit(0)

const relative = path.relative(root, path.resolve(root, file))
// Only files inside this repo, outside node_modules
if (relative.startsWith('..') || path.isAbsolute(relative) || relative.includes('node_modules')) {
  process.exit(0)
}

const run = (args) =>
  spawnSync('npx', ['--no-install', ...args], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })

if (shouldFormat(relative)) run(['prettier', '--write', '--ignore-unknown', relative])

if (shouldLint(relative)) {
  const lint = run(['eslint', '--fix', '--no-warn-ignored', relative])
  if (lint.status !== 0) {
    process.stderr.write(
      `ESLint found problems in ${relative}; fix them now:\n${lint.stdout}${lint.stderr}`,
    )
    process.exit(2)
  }
}
