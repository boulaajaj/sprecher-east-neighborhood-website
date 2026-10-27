import { describe, expect, it } from 'vitest'

import { inspect, parseCommands, readCommit, shouldFormat, shouldLint } from './rules.mjs'

const reason = (command) => inspect(command).reason

describe('parseCommands', () => {
  it('splits at operators and removes quotes', () => {
    expect(parseCommands(`git add -A && git commit -m "a; b" | cat`)).toEqual([
      ['git', 'add', '-A'],
      ['git', 'commit', '-m', 'a; b'],
      ['cat'],
    ])
  })
})

describe('forbidden commands', () => {
  it.each([
    'gh pr merge 12 --squash --admin',
    'gh pr merge --admin 12',
    'gh api -X PUT repos/o/r/pulls/1/merge-async -f bypass_rules=true',
    `echo '{"bypass_rules": true}' | gh api repos/o/r/pulls/1/merge --input -`,
    'git push origin main',
    'git push origin +main',
    'git push -f origin HEAD:main',
    'git push origin main:main',
    'git push origin HEAD:refs/heads/main',
    'git push origin :main',
    'git push --delete origin main',
    'git push origin "main"',
    "git push origin 'main'",
    'git -C ../wt push origin main',
    'cd x && git push origin master',
  ])('refuses %s', (command) => {
    expect(reason(command)).toMatch(/AGENTS\.md/)
  })

  it.each([
    'gh pr merge 12 --squash',
    'gh api -X PUT repos/o/r/pulls/1/merge-async -F bypass_rules=false',
    'git push origin agent/C-Builder/446-hooks',
    'git push origin feature/main',
    'git push origin fix-main-menu',
    'git push --force-with-lease origin HEAD',
    'git fetch origin main',
    'git rebase origin/main',
    'git checkout --detach origin/main',
    'git commit -m "never run gh pr merge --admin or push to main"',
  ])('allows %s', (command) => {
    expect(reason(command)).toBeNull()
  })

  it('leaves a push that names no branch to the caller, which checks the current one', () => {
    expect(inspect('git push').barePush).toBe(true)
    expect(inspect('git push -u origin').barePush).toBe(true)
    expect(inspect('git push origin HEAD').barePush).toBe(false)
  })
})

describe('readCommit', () => {
  it('sees when the commit stages everything itself', () => {
    expect(readCommit(['-am', 'x']).all).toBe(true)
    expect(readCommit(['-a', '-m', 'x']).all).toBe(true)
    expect(readCommit(['--all', '-m', 'x']).all).toBe(true)
  })

  it('reads a message as a message', () => {
    expect(readCommit(['-m', 'fix -a flag']).all).toBe(false)
    expect(readCommit(['-m', '-a']).all).toBe(false)
    expect(readCommit(['--message', 'all']).all).toBe(false)
  })

  it('is found through `git -C`', () => {
    expect(inspect('git -C ../wt commit -am x').commits).toEqual([{ all: true }])
  })
})

describe('file filters', () => {
  it('formats source and docs, lints only code', () => {
    expect(shouldFormat('src/a.tsx')).toBe(true)
    expect(shouldFormat('docs/a.md')).toBe(true)
    expect(shouldFormat('public/a.png')).toBe(false)
    expect(shouldLint('src/a.ts')).toBe(true)
    expect(shouldLint('docs/a.md')).toBe(false)
  })
})
