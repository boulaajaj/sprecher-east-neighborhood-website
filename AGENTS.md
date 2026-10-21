# AGENTS.md — Sprecher East website

This file is the repository's own memory of **how work is done here**, and the entry point for
everyone who changes it: any AI agent (Claude, ChatGPT/Codex, Copilot, Cursor, Gemini, or anything
else) and any human. Start here; it links to everything else.

It does not depend on any tool's private memory. If a tool's memory, a chat instruction, or
another doc in this repo conflicts with this file, **this file wins**. To change the rules,
change this file through the same workflow below.

## Ground rules

- **The name is "Sprecher East"**: never "SENA", "SE" or another abbreviation.
- **The site is unofficial and AI-assisted**, and says so. Content is factual and inclusive.
- **The repo is public.** Never commit secrets or real personal data (see
  [security](docs/guidelines/security.md)).

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
   - **sits on a native GitHub stack when it depends on another open PR**: its base is the
     branch of the PR below, and the PRs are joined in a stack so GitHub enforces the order they
     merge in. A merge order written in a description or a message is never enough
     ([`stacked-prs`](.agents/skills/stacked-prs/SKILL.md)).

3. **Review.** Every PR is reviewed before merge:
   - an **independent review** by a reviewer that did not write the change (a separate agent
     session following [`pr-review`](.agents/skills/pr-review/SKILL.md), or a human), posted
     on the PR
   - every review comment answered and its conversation resolved
   - the **owner (Amine)** reviews the PR and approves it **by merging**

   Changes to the process itself are policy changes, and the review must call them out
   explicitly for the owner. That covers `AGENTS.md`, `.agents/`, `docs/guidelines/`,
   `.github/`, and the tool adapters (`CLAUDE.md`, `.claude/`, `GEMINI.md`).

4. **Everything green.** All required checks pass before merge: `Type-check & Build`,
   `Prettier`, `ESLint`, `Dependency Audit`, and `PR Policy` (which verifies steps 1–2).
   Never bypass a failing or missing check. In a stack, every PR must be green on its own.

   Dependabot PRs are exempt from the issue and description rules only. They still need green
   checks, and the owner still merges them.

5. **Merge, then CI/CD takes over.** Only the owner merges (squash merge). A stack merges from
   the bottom up: merging a PR also merges every PR below it. The deploy workflow ships `main`
   to the VPS. After the merge, the linked issue is closed and gets a comment summarizing how it
   was fixed (`.github/workflows/issue-fix-summary.yml`).

### Never

- Never push to `main` directly or merge a PR as an agent. That includes `--admin`
  merges and any other ruleset bypass, even when the account you're using has admin rights.
- **Never change code on the server.** No editing files in `/var/www/sprecher-east`, no
  `git apply` or hotfixes over SSH. If production is broken, fix or revert through a PR.
- Never commit secrets (`.env.local`, keys, tokens, passwords).
- Never hand over dependent PRs as separate PRs with a merge order in prose. Stack them.

### Server configuration is not code — but it is still tracked

Some things live only on the servers: `.env.local`, the Caddy config, PM2, DNS records, and
third-party dashboards (Mailgun, Porkbun, Hostinger). Before changing any of them, open an issue
labeled `infra`. Say what will change and why, and how to roll it back. Afterwards, comment
on that issue with what was actually changed. Never put secret values in the issue.

### How GitHub enforces this

The `main` ruleset requires a pull request, the five checks above, and resolved conversations.
It also blocks force pushes and deletion. Stacks enforce the merge order of dependent PRs.
Agents currently work through the owner's GitHub account, which has admin rights, so GitHub
can't technically stop an agent from bypassing the ruleset, and it can't record a separate
approval. Until agents have their own GitHub identity, these rules depend on every agent
following this file. When agents get their own identity, the ruleset will also require one
approving review from the owner.

## Skills: how to do things

Procedures are [Agent Skills](https://agentskills.io), an open format: a folder in
`.agents/skills/` with a `SKILL.md` that starts with a `name` and a `description`. Tools that
support skills load them from there; any other agent or human reads them as plain Markdown.

| Skill                                                                  | Use it when                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`change-workflow`](.agents/skills/change-workflow/SKILL.md)           | Before any change: issue, branch, PR, review, checks, hand-off.           |
| [`stacked-prs`](.agents/skills/stacked-prs/SKILL.md)                   | A PR depends on another open PR, or a PR in a stack has to change.        |
| [`self-review`](.agents/skills/self-review/SKILL.md)                   | A change is done: review your own diff before opening or updating the PR. |
| [`visual-design-review`](.agents/skills/visual-design-review/SKILL.md) | The change affects how pages look.                                        |
| [`pr-review`](.agents/skills/pr-review/SKILL.md)                       | You are the independent reviewer of a PR you didn't write.                |
| [`wrapped`](.agents/skills/wrapped/SKILL.md)                           | The owner has merged: verify, check the deploy, close the loop, report.   |

## References: what is true here

| Doc                                                 | What's in it                                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`docs/project.md`](docs/project.md)                | The system: stack, hosting, environment variables, local setup, known gotchas.                        |
| [`docs/architecture/`](docs/architecture/README.md) | Where code goes, dependency rules, naming, data model, decisions. Read before coding.                 |
| [`docs/guidelines/`](docs/guidelines/README.md)     | Conventions by topic: development, security, Payload, Next.js and Tailwind, UI/UX, patterns, content. |
| [`ops/README.md`](ops/README.md)                    | Server scripts: deploy steps, backups and restore, Caddy limits.                                      |

## Where knowledge lives

Durable knowledge about this project lives in this repository and changes through the workflow
above. Not in a tool's private memory, a chat, or loose notes.

- A rule everyone follows on every change goes in this file.
- A convention goes in a guideline in `docs/guidelines/`.
- A procedure goes in a skill in `.agents/skills/`.
- A fact about the system goes in `docs/project.md` or `docs/architecture/`; the reason behind a
  decision goes in a decision record (`docs/architecture/decisions/`).

Write all of these for any agent and any human: no tool-specific commands or model names. Keep
each file under 250 lines.

## Tool adapters

Some tools look for their own file. Those files are thin adapters: they import or point to the
files above and hold only what is specific to that tool. Never put a rule, procedure or fact
only in an adapter.

| Tool           | Adapter                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------- |
| Claude Code    | `CLAUDE.md` (imports this file and the core references), `.claude/`                          |
| Gemini CLI     | `GEMINI.md` (imports this file); it reads `.agents/skills/` itself                           |
| GitHub Copilot | `.github/copilot-instructions.md`; Copilot also reads this file and `.agents/skills/` itself |
| Codex, Cursor  | None needed: they read this file and `.agents/skills/`.                                      |

A tool that needs its own file gets a short adapter that points here, listed in this table and in
the policy files of step 3. Tools that read both `.claude/skills/` and `.agents/skills/` (Copilot,
Cursor) list each skill twice. That is expected: the `.claude/skills/` copies only point to the
`.agents/skills/` ones, so don't delete either. One of them, `simplify`, is Claude Code's name for
`self-review`.
