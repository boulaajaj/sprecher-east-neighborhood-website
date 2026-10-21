<!--
Every PR must link an issue and fill in every section below. The "PR Policy" check enforces
this. Rules: AGENTS.md. Procedure: .agents/skills/change-workflow/SKILL.md
If this PR depends on another open PR, put both on a native GitHub stack and start this
description with the stack line: .agents/skills/stacked-prs/SKILL.md
-->

Closes #

## What changed

<!-- The concrete changes, file by file or area by area. -->

## Why

<!-- The problem from the linked issue, and why this is the right fix. -->

## How

<!-- The approach: key decisions, alternatives considered, anything a reviewer should know. -->

## How to test

<!-- Numbered steps someone else can follow, with the expected result for each. -->

1.

## Risk & rollback

<!-- What could break, server/env changes needed (no secret values), and how to undo it. -->

## Checklist

- [ ] The linked issue has a type, an area, and a priority label
- [ ] `npx tsc --noEmit`, ESLint and Prettier pass locally
- [ ] Independent review requested (`.agents/skills/pr-review/SKILL.md`)
- [ ] No secrets committed, and no code changed directly on the server
