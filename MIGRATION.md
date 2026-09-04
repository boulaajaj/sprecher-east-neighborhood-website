# Asana → GitHub Migration

**Status:** In progress. Tracking issue: #94

## Decision
All project work for the Sprecher East neighborhood website moves from Asana to GitHub. GitHub Issues + Projects become the single source of truth. Asana will be archived after verification.

## Plan
1. Export active Asana tasks, subtasks, comments, attachments, due dates.
2. Import as GitHub Issues in this repo (preserve titles, descriptions, labels, links).
3. Create a GitHub Project board (Scrum-style: Backlog → Ready → In Progress → In Review → Done) with a Sprint iteration field.
4. Add every migrated issue to the board.
5. Archive Asana (read-only, then delete once verified).

## Child issues
- #95 — Graphify knowledge graph setup
- #96 — CodeCohesion 3D visualization
- #97 — Document known holes (API overlay, grid pagination)

## Acceptance
- [ ] Zero open tasks in Asana
- [ ] Every item is a GitHub Issue on the project board
- [ ] `MIGRATION.md` (this file) documents steps + archive link
- [ ] Team confirms board usable for next sprint
