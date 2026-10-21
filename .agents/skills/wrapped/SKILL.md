---
name: wrapped
description: Post-merge wrap-up, run when the owner says the PRs are merged (or "wrapped") — verify each merge, check the deploy and the live site, report server results on the linked issues, close out any Asana task, sync your local main, and report. Use after an owner merge; never assume a merge happened.
---

# Wrapped: after the owner merges

Run this when the owner says the work is merged ("all PRs are merged", "wrapped", or similar).
Verify everything; never assume a merge or a deploy happened.

## 1. Verify the merges

For each PR from the work at hand:

```bash
gh api repos/{owner}/{repo}/pulls/<number> -q '.merged_at, .merge_commit_sha'
```

An empty `merged_at` means it isn't merged: say so and stop there for that PR. For a stack, the
owner may have merged only part of it; the PRs still open above are rebased by GitHub
([`stacked-prs`](../stacked-prs/SKILL.md), step 4).

## 2. Check the deploy and the site

A merge of code to `main` starts `Deploy to VPS` (`.github/workflows/deploy.yml`; docs-only
merges don't deploy).

1. Find the run for the merge commit and wait for it:
   `gh run list --workflow deploy.yml --commit <merge_commit_sha>`, then `gh run watch <id>`.
   Where the Actions API is blocked, ask for the deploy's check run by name (a `main` commit
   collects many other check runs):
   `gh api "repos/{owner}/{repo}/commits/<merge_commit_sha>/check-runs?check_name=Deploy"`.
   Its `id` is the job id for the next step.
2. Read its annotations (the `::notice` / `::warning` / `::error` lines the server scripts print):
   `gh api repos/{owner}/{repo}/check-runs/<job id>/annotations`.
3. Open https://sprechereast.com and check the behavior the PRs changed.

Never re-run or start the deploy yourself (it can be started by hand). A failed deploy goes to the
owner as a new issue, fixed through a PR. Never fix it on the server.

## 3. Close the loop on the issues

- The linked issues close themselves on merge, and `issue-fix-summary.yml` comments on each.
- For server changes (`infra` issues), comment what actually changed on the server, from the
  deploy annotations. Never paste secret values.
- An issue linked with `Part of #N` stays open until its last PR merges.

## 4. Asana (legacy, only if linked)

If a PR body has `Asana: https://app.asana.com/0/0/<task_gid>/f`, add a completion comment with
the PR link to that task and mark it complete
([`asana-workflow.md`](../../../docs/guidelines/asana-workflow.md)). No link, nothing to do.

## 5. Sync and report

```bash
git fetch origin && git switch main && git pull --ff-only origin main
```

Then report briefly: what merged, what deployed, the deploy's result, anything still open or
failing, and what the owner still has to do.
