---
name: change-workflow
description: Mandatory procedure for any code, config, or docs change to this repo — create a labeled GitHub issue, work on a branch, open a PR from the template, get it independently reviewed, wait for all checks to go green, and hand off to the owner to merge (which deploys). Use before starting any change.
---

# Change workflow

The rules are in [`AGENTS.md`](../../../AGENTS.md). This file is the step-by-step procedure.
Commands use the GitHub CLI (`gh`). Without it, do the same steps in the GitHub web UI.

## 1. Issue

1. Search first, so you don't open a duplicate: `gh issue list --search "<keywords>"`.
2. If there's no issue, create one from an issue form (web UI: **New issue** → pick a form).
   The CLI has no form support, so give it the same sections and labels by hand:

   ```bash
   gh issue create --title "<short problem statement>" \
     --label bug --label cms --label "priority: medium" \
     --body-file issue.md
   ```

   `issue.md` needs these sections: `### Problem`, `### Proposed fix`,
   `### Acceptance criteria`, `### Area`, `### Priority`.

3. Labels: exactly one type, at least one area, and one priority. Allowed values are in
   `.github/label-policy.json`.

## 2. Branch

```bash
git checkout main && git pull origin main
git checkout -b agent/<role-tag>/<issue-number>-<short-description>
```

Role tags: `A-Content`, `B-Research`, `C-Builder`, `D-Community`, `E-Ops`, `F-RD`.
Humans can use `<name>/<issue-number>-<short-description>`.

Commits:

- Imperative mood ("Add email adapter"), one logical change per commit.
- Reference the issue in the body (`Refs #123`).
- AI-written commits end with a `Co-Authored-By:` line naming the model.
- Never commit secrets.

## 3. Check locally before opening the PR

```bash
npx tsc --noEmit                    # zero errors
npx eslint . --max-warnings=10
npx prettier --check .              # fix with: npx prettier --write <files>
npm run build                       # when code or dependencies changed
```

For UI changes, check the affected pages at mobile and desktop widths, in light and dark themes.

## 4. Pull request

```bash
git push -u origin <branch>
gh pr create --base main --title "<type>: <summary>" --body-file pr.md
```

`pr.md` follows `.github/pull_request_template.md`. Fill in every section; the `PR Policy`
check fails otherwise:

- `Closes #<issue>` — links the issue and closes it on merge. Use `Part of #<issue>`
  when more PRs will follow; the last PR uses `Closes`.
- **What changed**, **Why**, **How**, **How to test** (numbered steps someone else can
  follow), **Risk & rollback**

Open it as a draft (`--draft`) while work is incomplete.

## 5. Review and checks

1. **Get an independent review.** Start a separate reviewer (a different agent session or a
   human) on [`pr-review`](../pr-review/SKILL.md). The author never reviews their own PR.
2. **Wait for CI without pushing.** Every push restarts the checks. Check roughly once a minute:

   ```bash
   gh pr checks <number> --watch
   gh pr view <number> --comments
   ```

   If the checks haven't finished after 15 minutes, stop and alert the owner.

3. **Act on the results:**
   - Check failed → fix, push, then wait again.
   - Review comments → fix or explain. Reply on each thread saying what you did, then
     resolve it. Never leave a conversation unresolved.
4. **Ready:** everything is green, the review is posted and its findings are addressed. Tell
   the owner the PR is ready for approval.

## 6. Merge and deploy (owner)

- Only the owner merges (squash); merging is the owner's approval. Agents never merge,
  and never use `--admin` or any other bypass.
- The merge triggers `Deploy to VPS`. Watch it: `gh run list --workflow deploy.yml -L 1`.
- Afterwards, check the site (`https://sprechereast.com`) and the specific behavior changed.
- The issue closes automatically. `issue-fix-summary.yml` comments on it with how it was fixed.

## Server or dashboard changes (`infra`)

For `.env.local`, Caddy, PM2, DNS, Mailgun, Porkbun, or Hostinger changes:

1. Open an issue labeled `infra` with the planned change, the reason, and the rollback.
2. Make the change. Back up any file first (`cp file file.bak-YYYYMMDD`).
3. Comment on the issue with what you changed. Never include secret values.

Code is never edited on the server. Code changes always go through steps 1–6.
