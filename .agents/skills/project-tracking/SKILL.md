---
name: project-tracking
description: Keep the project's plan on GitHub. Before starting work, read the issue's epic, milestone, sprint and blockers; when filing new work, put it at the right level with labels, parent, milestone and dependencies; answer "what's next?" and "what got done this week?" from GitHub, not from memory. Use when picking up, filing or reporting work.
---

# Project tracking

The conventions are in [how we work](../../../docs/process/project-management.md), and the
milestones and epics in the [roadmap](../../../docs/product/roadmap.md). This skill is the
procedure. GitHub is the only source of truth: answer from it, never from memory or chat history.

The commands use the REST API through `gh api`, which works in cloud sessions too (`gh issue` and
`gh pr` subcommands use GraphQL, which some sandboxes block). In this repo, `{owner}/{repo}` is
`boulaajaj/sprecher-east-neighborhood-website`. List calls return at most 100 items, so loop over
`&page=N` as in §3 when a list can be longer; `--paginate` fails in some sandboxes.

## 1. Before starting an issue

```bash
gh api repos/{owner}/{repo}/issues/<n> -q '{title, state, milestone: .milestone.title, labels: [.labels[].name]}'
gh api repos/{owner}/{repo}/issues/<n>/parent -q '"#\(.number) \(.title)"'      # its epic (404: none)
gh api repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by -q '.[] | "#\(.number) \(.state)"'
```

The sprint and the size are board fields: read them as in §2 step 4. Start only if the issue is
**Ready**:

- it has acceptance criteria, a parent, type, area and priority labels, and a size
- nothing it's blocked by is still open
- it isn't labeled `needs owner`
- no open PR already closes it (the list in §2 step 3)

Cloud sessions can't read the board, so they skip the size check and say so in a comment on the
issue. If the issue isn't Ready, make it Ready (add what's missing) or pick another one. Read the
parent epic too: it says what the issue is part of.

## 2. "What's next?"

1. Find the current milestone, the open one with the nearest due date:
   `gh api "repos/{owner}/{repo}/milestones?state=open&sort=due_on&direction=asc" -q '.[0] | {number, title, due_on, open_issues, closed_issues}'`
2. List its open issues:
   `gh api "repos/{owner}/{repo}/issues?milestone=<number>&state=open&per_page=100" -q '.[] | select(.pull_request | not) | "#\(.number) [\([.labels[].name] | join(", "))] \(.title)"'`
3. Leave out:
   - epics, and anything labeled `needs owner`
   - anything with an open blocker (one `blocked_by` call per issue, as in §1)
   - anything an open PR already closes or is part of. Those are **in progress**:

     ```bash
     gh api "repos/{owner}/{repo}/pulls?state=open&per_page=100" \
       -q '.[] | "PR #\(.number) → \([(.body // "") | scan("(?i)(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|part of):?\\s+#[0-9]+")] | join(", "))"'
     ```

   Order the rest by priority label, then by the order of the epic's sub-issues
   (`gh api repos/{owner}/{repo}/issues/<epic>/sub_issues`).

4. On the owner's computer, the board is the authority on what's in the sprint. Read the current
   sprint with
   `gh project item-list <project-number> --owner boulaajaj --limit 1000 --query "sprint:@current" --format json`.
   That needs `gh` signed in with the `project` scope. Cloud sessions can't reach the board, so
   say that the answer comes from the milestone instead.

## 3. Filing new work

1. **Choose the level** ([how we work](../../../docs/process/project-management.md#levels-of-work)).
   - A new capability that takes weeks is an epic: label it `epic`.
   - One deliverable is a feature or a task.
   - Something broken is a bug.
2. **Search first** to avoid duplicates. Loop over the pages, since the repo has more than 100
   issues and PRs:

   ```bash
   for p in $(seq 1 20); do
     url="repos/{owner}/{repo}/issues?state=all&per_page=100&page=$p"
     gh api "$url" -q '.[] | select(.pull_request | not) | select(.title | test("<word>"; "i")) | "#\(.number) \(.state) \(.title)"'
     [ "$(gh api "$url" -q length)" -lt 100 ] && break
   done
   ```

3. **Create it** with the issue form's sections (`### Problem`, `### Proposed fix`,
   `### Acceptance criteria`, `### Area`, `### Priority`) in `issue.md`:

   ```bash
   gh api -X POST repos/{owner}/{repo}/issues -f title='<type>: <short problem statement>' \
     -F body=@issue.md -f 'labels[]=bug' -f 'labels[]=cms' -f 'labels[]=priority: medium' \
     -F milestone=<number>   # only if it's planned
   ```

   Exactly one type, at least one area and one priority ([`.github/label-policy.json`](../../../.github/label-policy.json)).

4. **Link it:**

   ```bash
   id=$(gh api repos/{owner}/{repo}/issues/<new> -q .id)
   gh api -X POST repos/{owner}/{repo}/issues/<epic>/sub_issues -F sub_issue_id=$id
   # It can't start before another issue is done:
   blocker=$(gh api repos/{owner}/{repo}/issues/<blocker> -q .id)
   gh api -X POST repos/{owner}/{repo}/issues/<new>/dependencies/blocked_by -F issue_id=$blocker
   ```

   A sub-issue has one parent. Don't move an issue to another epic just to group it; use a label
   or a link in the epic's description instead.

5. **Needs the owner?** If only the owner can do it (a login, a payment, a decision):
   - label it `needs owner`
   - add it to the checklist in the owner-actions epic (#169); its parent stays its own epic
   - mark the issues that depend on it as blocked by it

   Tell the owner in one line what you need from him.

## 4. While working

- Keep the issue current: comment when something important is decided or found, and when a
  plan changes.
- New work found along the way becomes a new issue (§3). Don't widen the current PR.
- On the owner's computer, move the board's **Status** (`In progress`, `In review`) with
  `gh project item-edit`. Closing an issue or merging a PR moves the item to Done on its own.
  In cloud sessions, leave the board to its automations.

## 5. Weekly report: "what got done this week?"

```bash
since=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)
gh api "repos/{owner}/{repo}/issues?state=closed&since=$since&per_page=100" \
  -q ".[] | select(.pull_request | not) | select(.state_reason == \"completed\") | select(.closed_at >= \"$since\") | \"#\\(.number) \\(.title)\""
gh api "repos/{owner}/{repo}/milestones?state=open" -q '.[] | "\(.title): \(.closed_issues) done, \(.open_issues) open, due \(.due_on)"'
```

`since` filters by last update, so the `closed_at` check keeps only the issues closed in the
window, and `state_reason` drops duplicates and won't-fix. Report:

- what shipped (closed issues, grouped by epic: one `/parent` call per issue, as in §1)
- what's in progress (the open-PR list in §2 step 3)
- what's Ready next (§2)
- what's waiting on the owner (`needs owner`)
- milestone progress

Keep it short. It's for reading in a minute.
