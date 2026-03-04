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

- Asana task comments contain the PR URL
- PR descriptions contain the Asana task URL (format: `Asana: https://app.asana.com/...`)
- This two-way linking makes it easy to navigate between project management and code

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

## Post-Merge Checklist (`/wrapped`)

When the user says "all PRs are merged", "/wrapped", or similar — run this checklist automatically without being asked:

1. **Verify**: `gh pr list --state merged` — confirm PRs are actually merged, don't assume
2. **Asana**: For each merged PR, find the related Asana task, add a completion comment with the PR link, and mark it complete
3. **Memory**: Update `MEMORY.md` — move PRs to merged list, remove from open
4. **Sync**: `git checkout main && git pull origin main`
5. **Report**: Brief summary of what was closed

Never skip steps or assume state — always check first.

## Integration Notes

- Asana is on the **free plan** — no official GitHub app integration available
- Linking is manual: paste PR URLs into Asana task comments, paste Asana URLs into PR descriptions
- Future option: GitHub Action (`Asana/create-app-attachment-github-action`) for automated linking if Asana plan is upgraded
