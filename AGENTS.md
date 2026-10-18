# AGENTS.md — Sprecher East website

This file is the repository's own memory of **how changes are made here**. It applies to
everyone who changes this repo: any AI agent (Claude, ChatGPT/Codex, Copilot, Cursor, Gemini,
or anything else) and any human.

It does not depend on any tool's private memory. If a tool's memory, a chat instruction, or
another doc in this repo conflicts with this file, **this file wins**. To change the rules,
change this file through the same workflow below.

## The only way code reaches `main` and production

Merging code changes to `main` deploys them to production automatically
(`.github/workflows/deploy.yml`). So every change, however small, follows these five steps:

1. **Issue first.** Start from a GitHub issue created with one of the issue forms in
   `.github/ISSUE_TEMPLATE/`. It describes the problem (or goal) and acceptance criteria.
   Labels:
   - exactly one **type**: `bug`, `enhancement`, `documentation`, `tech-debt`, or `process`
   - one or more **areas**, such as `frontend`, `cms`, `auth`, `ci`, `infra`, or `dependencies`
   - one **priority**: `priority: high`, `priority: medium`, or `priority: low`

   The issue forms apply these automatically (`.github/workflows/issue-labels.yml`). The
   allowed values live in one place: `.github/label-policy.json`.

2. **Branch and pull request.** Work on a branch, never on `main`. Open a PR that:
   - links the issue with a closing keyword (`Closes #123`), or with `Part of #123` when an
     issue needs several PRs (the last one uses `Closes`)
   - fills in every section of `.github/pull_request_template.md`: **What changed**,
     **Why**, **How**, **How to test**, **Risk & rollback**

3. **Review.** Every PR is reviewed before merge:
   - an **independent review** by a reviewer that did not write the change (a separate agent
     session following `.agents/skills/pr-review/SKILL.md`, or a human), posted on the PR
   - every review comment answered and its conversation resolved
   - the **owner (Amine)** reviews the PR and approves it **by merging**

   Changes to the process itself are policy changes, and the review must call them out
   explicitly for the owner. That covers `AGENTS.md`, `.agents/`, `.github/`, `CLAUDE.md`,
   and `.claude/`.

4. **Everything green.** All required checks pass before merge: `Type-check & Build`,
   `Prettier`, `ESLint`, `Dependency Audit`, and `PR Policy` (which verifies steps 1–2).
   Never bypass a failing or missing check.

   Dependabot PRs are exempt from the issue and description rules only. They still need green
   checks, and the owner still merges them.

5. **Merge, then CI/CD takes over.** Only the owner merges (squash merge). The deploy
   workflow ships `main` to the VPS. After the merge, the linked issue is closed and gets a
   comment summarizing how it was fixed (`.github/workflows/issue-fix-summary.yml`).

### Never

- Never push to `main` directly or merge a PR as an agent. That includes `--admin`
  merges and any other ruleset bypass, even when the account you're using has admin rights.
- **Never change code on the server.** No editing files in `/var/www/sprecher-east`, no
  `git apply` or hotfixes over SSH. If production is broken, fix or revert through a PR.
- Never commit secrets (`.env.local`, keys, tokens, passwords).

### Server configuration is not code — but it is still tracked

Some things live only on the servers: `.env.local`, the Caddy config, PM2, DNS records, and
third-party dashboards (Mailgun, Porkbun, Hostinger). Before changing any of them, open an issue
labeled `infra`. Say what will change and why, and how to roll it back. Afterwards, comment
on that issue with what was actually changed. Never put secret values in the issue.

### How GitHub enforces this

The `main` ruleset requires a pull request, the five checks above, and resolved conversations.
It also blocks force pushes and deletion. Agents currently work through the owner's GitHub
account, which has admin rights, so GitHub can't technically stop an agent from bypassing
the ruleset, and it can't record a separate approval. Until agents have their own GitHub
identity, these rules depend on every agent following this file. When agents get their own
identity, the ruleset will also require one approving review from the owner.

## How to do it

- Step-by-step procedure for whoever makes a change:
  [`.agents/skills/change-workflow/SKILL.md`](.agents/skills/change-workflow/SKILL.md)
- Procedure for the independent PR review:
  [`.agents/skills/pr-review/SKILL.md`](.agents/skills/pr-review/SKILL.md)

These follow the open Agent Skills format (`SKILL.md`), so any agent can read and use them.

## Project context

Stack, architecture, conventions, and hosting details are in `CLAUDE.md` and `.claude/rules/`.
Despite the folder name, those apply to every agent and human, not just Claude.
