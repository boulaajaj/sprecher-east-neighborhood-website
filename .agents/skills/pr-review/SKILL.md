---
name: pr-review
description: Independent review of a pull request in this repo before the owner approves it — checks the linked issue, PR description, scope, correctness, security, and CI, then posts findings on the PR by severity. Use when asked to review a PR; never review a PR you authored.
---

# PR review

You are the independent reviewer required by [`AGENTS.md`](../../../AGENTS.md) step 3.
Review the change as someone who didn't write it. If you wrote any part of this PR, stop and
say so.

## 1. Gather context

```bash
gh pr view <number> --json title,body,author,labels,files,closingIssuesReferences
gh pr diff <number>
gh issue view <linked-issue-number>
gh pr checks <number>
```

## 2. Check the process (blockers if missing)

- [ ] The PR links an issue with a closing keyword. The issue describes the problem and has a
      type, an area, and a priority label.
- [ ] Every PR template section is filled in: What changed, Why, How, How to test,
      Risk & rollback.
- [ ] The diff matches the issue. No unrelated changes slipped in.
- [ ] The test steps are concrete enough for someone else to follow.
- [ ] **Policy changes are flagged.** If the diff touches `AGENTS.md`, `.agents/`,
      `.github/` (workflows, templates, label policy), `CLAUDE.md`, or `.claude/`, list
      each such change under **Major** so the owner signs off on it explicitly. A PR can
      change the checks that run on itself, so read workflow changes carefully.

## 3. Check the change

- **Correctness:** does it do what the issue asks? Look for edge cases, error handling,
  failure modes, and behavior when configuration is missing (local dev, CI).
- **Security:** no secrets in the diff. Input is validated at boundaries. Access control on
  Payload collections and endpoints is unchanged or intentionally changed.
- **Framework first:** uses Payload/Next.js features and official plugins rather than custom
  code (`.claude/rules/development.md`).
- **Configuration over code:** environment-specific values come from env vars, and new env
  vars are documented in `.env.local.example`.
- **Dependencies:** new packages are needed, maintained, and version-compatible. The lockfile
  is updated.
- **Data and deploy:** database migrations, `.env.local` changes on the server, and the
  rollback plan are all spelled out in the PR.
- **UI changes:** check visually at mobile and desktop widths, in both themes. Check
  accessibility (labels, contrast, focus).

## 4. Post the review on the PR

Group findings by severity:

- **Blocker:** must fix before merge (broken behavior, security issue, missing process step)
- **Major:** should fix before merge
- **Minor:** fine to fix in a follow-up issue

```bash
gh pr review <number> --comment --body-file review.md
```

For a specific line, add inline comments in the web UI or with `gh api`. End the review with a
verdict: **Ready for owner approval** or **Changes requested** (list them). Approval itself
belongs to the owner.
