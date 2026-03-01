# Asana-GitHub Workflow

## Task Completion Rules

A development or content task is only marked **complete** in Asana when its PR is **merged to `main`**. Until then, the task stays open with progress comments.

## PR Linking

Every task that produces code or content changes must have a PR link in the Asana task notes. Format:

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
- **PR created**: Add the PR link to the task notes
- **PR blocked or needs changes**: Comment with the blocker and what's needed
- **PR merged to main**: Mark the task complete and add the final PR link with `(merged to main)`
- **Task blocked by external dependency**: Comment with what's blocking and leave task open

## Task-PR Traceability

- Asana task notes contain the PR URL
- PR descriptions contain the Asana task URL (format: `Asana: https://app.asana.com/...`)
- This two-way linking makes it easy to navigate between project management and code

## Integration Notes

- Asana is on the **free plan** — no official GitHub app integration available
- Linking is manual: paste PR URLs into Asana task notes, paste Asana URLs into PR descriptions
- Future option: GitHub Action (`Asana/create-app-attachment-github-action`) for automated linking if Asana plan is upgraded
