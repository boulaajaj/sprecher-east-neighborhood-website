import { describe, expect, it } from 'vitest'

import { commitsAll, forbiddenReason, isCommit, shouldFormat, shouldLint } from './rules.mjs'

describe('forbiddenReason', () => {
  it.each([
    'gh pr merge 12 --squash --admin',
    `gh api -X PUT repos/o/r/pulls/1/merge-async -f bypass_rules=true`,
    `echo '{"bypass_rules": true}' | gh api --input -`,
    'git push origin main',
    'git push -f origin HEAD:main',
    'git push origin refs/heads/main && echo ok',
    'git push origin master',
  ])('refuses %s', (command) => {
    expect(forbiddenReason(command)).toMatch(/AGENTS\.md/)
  })

  it.each([
    'gh pr merge 12 --squash',
    `gh api -X PUT repos/o/r/pulls/1/merge-async -F bypass_rules=false`,
    'git push origin agent/C-Builder/446-hooks',
    'git push --force-with-lease origin HEAD',
    'git push origin fix-main-menu',
    'git fetch origin main',
    'git rebase origin/main',
  ])('allows %s', (command) => {
    expect(forbiddenReason(command)).toBeNull()
  })
})

describe('commit detection', () => {
  it('sees a commit, with or without -C', () => {
    expect(isCommit('git commit -m "x"')).toBe(true)
    expect(isCommit('git -C ../wt commit -m x')).toBe(true)
    expect(isCommit('git log --oneline')).toBe(false)
  })

  it('sees when the commit stages everything itself', () => {
    expect(commitsAll('git commit -am "x"')).toBe(true)
    expect(commitsAll('git commit --all -m x')).toBe(true)
    expect(commitsAll('git commit -m "a message"')).toBe(false)
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
