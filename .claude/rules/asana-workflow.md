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
# Load PAT (Windows — needed once per shell session)
ASANA_PAT=$(powershell -Command "[Environment]::GetEnvironmentVariable('ASANA_PAT', 'User')")

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

Key GIDs:

- Workspace: `1207130419401827` (Meadowlands Together)
- Sprint Board project: `1213444671237732`

**Why REST API over MCP**: The Asana MCP connector lacks comment/story support, subtask creation, and has limited filtering. The PAT gives full API access including comments, attachments, sections, and custom fields.

**Windows note**: Always pass JSON payloads via temp files (`-d @/tmp/file.json`) — inline JSON with single quotes breaks in Git Bash on Windows.

## Integration Notes

- Asana is on the **free plan** — no official GitHub app integration available
- Linking is manual: paste PR URLs into Asana task comments, paste Asana URLs into PR descriptions
- Future option: GitHub Action (`Asana/create-app-attachment-github-action`) for automated linking if Asana plan is upgraded
