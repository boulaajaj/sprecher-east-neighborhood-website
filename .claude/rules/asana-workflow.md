# Asana-GitHub Workflow

## Task Completion Rules

A development or content task is only marked **complete** in Asana when its PR is **merged to `main`**. Until then, the task stays open with progress comments.

## PR Linking

Every task that produces code or content changes must have a PR link posted as an Asana task comment. Format:

```text
**PR**: https://github.com/boulaajaj/sprecher-east-neighborhood-website/pull/<number> (status)
```

Status values: `open`, `CI passing`, `awaiting review`, `merged to main`

## Progress Comments

When updating an Asana task, add a bullet-point comment covering:

- What was done in this session
- Current blockers or dependencies
- PR link and CI status
- What remains before the task can be completed

Keep comments concise. One comment per work session, not per commit.

## When to Update Asana

- **Starting work on a task**: Add a comment noting work has begun and the branch name
- **PR created**: Add the PR link as a task comment
- **PR blocked or needs changes**: Comment with the blocker and what's needed
- **PR merged to main**: Mark the task complete and add the final PR link with `(merged to main)`
- **Task blocked by external dependency**: Comment with what's blocking and leave task open

## Task-PR Traceability

Every PR that relates to an Asana task must have two-way linking:

- **PR → Asana**: PR description contains `Asana: https://app.asana.com/0/0/<task_gid>/f` on its own line
- **Asana → PR**: Asana task comment contains the PR URL (added when PR is created and when merged)

This enables `/wrapped` to auto-complete tasks and makes it easy to navigate between project management and code.

## Asana API Access

Use the Asana REST API via `$ASANA_PAT` (Personal Access Token, user env var) for all task operations:

```bash
# Load env vars (Windows — needed once per shell session)
# CRITICAL: use powershell.exe (not powershell) and pipe through tr -d '\r\n' to strip Windows line endings
ASANA_PAT=$(powershell.exe -Command "[System.Environment]::GetEnvironmentVariable('ASANA_PAT', 'User')" | tr -d '\r\n')
ASANA_WORKSPACE_GID=$(powershell.exe -Command "[System.Environment]::GetEnvironmentVariable('ASANA_WORKSPACE_GID', 'User')" | tr -d '\r\n')
ASANA_PROJECT_GID=$(powershell.exe -Command "[System.Environment]::GetEnvironmentVariable('ASANA_PROJECT_GID', 'User')" | tr -d '\r\n')

# Add a comment to a task
echo '{"data":{"text":"Your comment here"}}' > /tmp/asana_comment.json
curl -s -X POST -H "Authorization: Bearer $ASANA_PAT" \
  -H "Content-Type: application/json" \
  -d @/tmp/asana_comment.json \
  "https://app.asana.com/api/1.0/tasks/{task_gid}/stories"

# Update a task (name, notes, completed, assignee, due_on, etc.)
echo '{"data":{"completed":true}}' > /tmp/asana_update.json
curl -s -X PUT -H "Authorization: Bearer $ASANA_PAT" \
  -H "Content-Type: application/json" \
  -d @/tmp/asana_update.json \
  "https://app.asana.com/api/1.0/tasks/{task_gid}"

# List tasks in a project
curl -s -H "Authorization: Bearer $ASANA_PAT" \
  "https://app.asana.com/api/1.0/projects/{project_gid}/tasks?opt_fields=name,completed,assignee.name,due_on"
```

Key GIDs (set as user env vars — see onboarding docs in strategy repo):

- Workspace: `$ASANA_WORKSPACE_GID`
- Sprint Board project: `$ASANA_PROJECT_GID`

**Why REST API over MCP**: The Asana MCP connector lacks comment/story support, subtask creation, and has limited filtering. The PAT gives full API access including comments, attachments, sections, and custom fields.

**Windows note**: Always pass JSON payloads via temp files (`-d @/tmp/file.json`) — inline JSON with single quotes breaks in Git Bash on Windows.

## Ad-Hoc Work Tracking

All significant work must be tracked in Asana — not just planned sprint items. When work arises mid-session (bug report, design feedback, missing feature discovery), create an Asana task **before** starting the fix.

### Task Categories

Use the category as a prefix in the task name: `[role-tag] Category: description`

| Category        | When to use                                      | Example                                                  |
| --------------- | ------------------------------------------------ | -------------------------------------------------------- |
| **Bug**         | Something is broken or producing wrong output    | `[C-Builder] Bug: Contact form doesn't appear`           |
| **Feature**     | New capability that doesn't exist yet            | `[C-Builder] Feature: Calendar export for events`        |
| **Improvement** | Enhancing something that already works           | `[C-Builder] Improvement: Left-align content sections`   |
| **Task**        | Maintenance, docs, skills, CI, workflow changes  | `[E-Ops] Task: Add text alignment design principle`      |
| **Spike**       | Research or investigation (may not produce code) | `[B-Research] Spike: Evaluate commenting system options` |

The agent judges the category based on context — no need to ask the user which type it is.

### Significance Threshold

**Create a task if** the work:

- Will produce a commit (code, config, skill, or docs change)
- Changes how agents work (skills, rules, workflows)
- Fixes something a user would notice

**Skip task creation for:**

- Typo fixes and formatting-only changes
- Changes already covered by an existing open task (add a comment to that task instead)
- Trivial one-line fixes within the scope of a larger in-progress task

### One Task = One PR

Every task maps to exactly one PR. Don't bundle unrelated changes into one PR even if they feel related. This ensures:

- Clean Asana ↔ PR traceability
- Easier code review (smaller, focused diffs)
- Simpler rollback if something breaks

If a session produces multiple fixes, create multiple tasks and multiple PRs.

### Workflow

1. Work comes in (user request, bug report, review finding)
2. Judge the category based on context
3. Create Asana task in the current sprint section
4. Create a branch and start working
5. Comment on the task with branch name
6. Link PR when created
7. Complete the task when the PR merges to main

## Post-Merge Checklist (`/wrapped`)

When the user says "all PRs are merged", "/wrapped", or similar — run this checklist automatically without being asked:

1. **Identify**: Use the PR numbers from the current session. Verify each with `gh pr view <number> --json state` — confirm actually merged, don't assume.
2. **Asana**: For each verified merged PR, extract the Asana task GID from the PR body (`Asana: https://app.asana.com/0/0/<task_gid>/f`). Add a completion comment with the PR link and mark the task complete. If no Asana link in the PR body, skip — not every PR maps to a task.
3. **Memory**: Update the auto-memory `MEMORY.md` (persistent across sessions) with merged PR entries.
4. **Sync**: `git checkout main && git pull origin main`
5. **Report**: Brief summary of what was closed.

Never skip steps or assume state — always verify first.

## Integration Notes

- Asana is on the **free plan** — no official GitHub app integration available
- Linking is manual: paste PR URLs into Asana task comments, paste Asana URLs into PR descriptions
- Future option: GitHub Action (`Asana/create-app-attachment-github-action`) for automated linking if Asana plan is upgraded
