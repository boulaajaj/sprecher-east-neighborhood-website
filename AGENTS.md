# Sprecher East agent entry point

Sprecher East is an unofficial, AI-assisted neighborhood initiative in Madison,
Wisconsin. Work should help residents; source factual claims and use the full
brand name.

## Start here

- Read `CLAUDE.md` for the current stack, source map, and development setup.
- Read `.claude/rules/git-workflow.md` for the PR lifecycle. Other task-relevant
  rules in `.claude/rules/` apply across assistants, not only Claude.
- `MIGRATION.md` records the move to GitHub Issues and Projects. Keep legacy
  Asana references where relevant; do not duplicate new work there by default.
- `HANDOFF.md` is historical. Do not use its Sanity/Vercel instructions to set up
  or deploy the current Payload/SQLite application.
- Specialized `.claude/agents/` profiles can contain older assumptions. Verify
  package names and paths against `package.json` and `src/` before acting.

## Working agreement

- Use `agent/<role-tag>/<description>` branches and PRs; never push to `main`.
- Before the first push, check `gh pr view --json state --jq '.state'`. If the
  branch's PR is merged or closed, start a new branch from `origin/main`.
- Include summary, role tag, and test plan in PRs, and a `Co-Authored-By` trailer
  in AI-generated commits. Hand off to the owner for merge.
- For addressed review threads: push the fix, reply with the commit and reasoning,
  then resolve the thread. Never resolve without the explanation.
- Ask before destructive operations, schema changes, or changing auth providers.
- Keep secrets in `.env.local` or system environment variables. Never commit
  local databases, uploads, credentials, or dependency caches.
- Fix what the task requires; record unrelated findings without expanding the PR.

## Development and verification

- Install with `npm ci`; `.npmrc` supplies `legacy-peer-deps=true`.
- Copy `.env.local.example` to `.env.local` and supply local values when running
  the app. Production data and credentials are not needed for static checks.
- Run `npm run lint`, `npm run typecheck`, and formatting checks for changed files.
- For application changes, also follow the build/database setup in
  `.github/workflows/ci.yml`; run migrations only against an authorized local or
  disposable database. Never substitute production connection details.
- Report failed or unavailable checks explicitly. A successful CI build does not
  imply that lint, dependency audit, and CodeQL all passed.

## Architecture

The current application uses Payload collections and layout blocks, shared
components, and Next.js App Router groups `(frontend)` and `(payload)`. There is
no enforced `ui/features/sections/layout` hierarchy. Native Payload authentication
is implemented; social OAuth is not installed in this checkout.

See `docs/harness-audit-2026-09-06.md` for the AI-mise audit and visualization status.
