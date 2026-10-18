# Git Workflow and Development Lifecycle

**The change workflow is defined in [`AGENTS.md`](../../AGENTS.md), and the step-by-step
procedure is in [`.agents/skills/change-workflow/SKILL.md`](../../.agents/skills/change-workflow/SKILL.md).**
Both are tool-agnostic and are the source of truth. This file only adds Claude Code specifics.
If anything here conflicts with them, `AGENTS.md` wins.

Summary: issue → branch → PR (template filled, `Closes #N`) → independent review → all
checks green → owner approves and merges → GitHub Actions deploys. Agents never merge,
never push to `main`, and never change code on the server.

## Branch protection

See "How GitHub enforces this" in `AGENTS.md`. Agents use the owner's admin account, so
nothing technical stops a bypass. Never use `gh pr merge` (with or without `--admin`), and
never push to `main`.

## Claude Code specifics

- **Before opening a PR**, run `/simplify` on the diff and fix all Critical and High findings.
  For visual changes, it runs `/visual-design-review` across viewports and themes.
- **Independent review:** use the `pr-review` skill in a separate session or subagent
  (e.g. the `qa-reviewer` agent). Never review your own PR in the same context that wrote it.
- **Polling after a push:** wait for checks in the background (`run_in_background`) using
  `gh pr checks <number>`, about once a minute and for at most 15 minutes. Don't push while
  waiting. If the checks still haven't finished after 15 minutes, alert the user.
- **Asana:** if the work relates to an Asana task, add
  `Asana: https://app.asana.com/0/0/<task_gid>/f` on its own line in the PR description.

## Security rules

- Never commit `.env.local` or any file with secrets, and never commit SSH private keys.
- Secret scanning and push protection block pushes that contain secrets.
- Fix CodeQL findings before merging. Review Dependabot PRs promptly.

## Memory backup

Project context belongs in the repository (`AGENTS.md`, `CLAUDE.md`, `.claude/rules/`,
`docs/memory/`), not in any tool's private memory. Updates go through the same issue → PR
workflow as code.
