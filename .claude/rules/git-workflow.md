# Git Workflow and Development Lifecycle

## Branch Protection

- `main` is protected on both repos (website + strategy)
- No direct pushes to main — all changes go through pull requests
- Force pushes and branch deletion on main are blocked

## Branch Naming Convention

```
agent/<role-tag>/<short-description>
```

Examples:

- `agent/C-Builder/fix-auth-bug`
- `agent/A-Content/update-about-page`
- `agent/B-Research/audit-accessibility`
- `agent/E-Ops/update-ci-pipeline`

Role tags match the consolidated skill profiles:

- `A-Content` — Content and Voice
- `B-Research` — Research and Quality
- `C-Builder` — Code, design, infra, analytics
- `D-Community` — Community and Events
- `E-Ops` — Operations
- `F-RD` — R&D (on-demand)

## Session Workflow

### Starting a Session

1. `cd ~/OneDrive/sprecher-east-neighborhood-website`
2. `git checkout main && git pull origin main`
3. Create a feature branch: `git checkout -b agent/<role>/<description>`
4. Work on the branch — commit frequently with clear messages

### Commit Conventions

- Use imperative mood: "Add feature" not "Added feature"
- Include Co-Authored-By line for AI-generated code
- Keep commits focused — one logical change per commit
- Never commit secrets, keys, or credentials

### Pre-PR Checklist

Before creating a pull request, run these checks in order:

1. **`/simplify` (Claude Code skill)** — runs 3 parallel review agents (code reuse, code quality, efficiency) on the diff. Fix all findings before proceeding. This catches duplicated patterns, magic strings, missed abstractions, and performance issues.
2. **Type-check**: `npx tsc --noEmit` — must pass with zero errors
3. **Lint & format**: `npx lint-staged --no-stash` — or run `npx eslint . && npx prettier --check .` manually
4. **Visual QA** (only when the diff touches CSS, Tailwind classes, HTML structure, or component markup that affects rendering): screenshot affected pages at all 6 viewports using Playwright MCP (see `skill-nextjs-tailwind.md`). Skip for backend-only, config-only, or docs-only changes.

### Creating a Pull Request

1. Push the branch: `git push -u origin <branch-name>`
2. Create a **Draft PR** if work is incomplete
3. PR description must include:
   - **Summary**: What changed and why (2-3 bullet points)
   - **Role**: Which agent profile made the changes (e.g., `[C-Builder]`)
   - **Asana link**: `Asana: https://app.asana.com/0/0/<task_gid>/f` — on its own line, required if the work relates to an Asana task. This is parsed by `/wrapped` to auto-complete tasks.
   - **Test plan**: How to verify the changes work
4. Wait for CI checks (type-check, build, CodeQL) to pass

### After Review Comments

Once CI passes and reviewers submit comments (see Post-PR Review Polling below):

1. **Resolve all review comments on GitHub**: For each reviewer comment, reply on the PR thread explaining what was fixed and why the suggestion was adopted (or why it was declined). This gives the project owner visibility and signals to automated reviewers that the comment was addressed. Never leave comments unresolved.
2. Review the diff — if you can't explain the code, it doesn't ship
3. **Hand off to Amine for merge** — the agent does not merge PRs. The project owner reviews and merges to maintain visibility into what goes to production. (Squash merge preferred for clean history.)

### Post-PR Review Polling

After any push to a PR branch, poll for CI completion and review comments. **Do not push any commits while polling** — CI restarts on every push, so pushing mid-wait resets the clock and wastes time.

**Phase 1 — Wait for CI (read-only, no pushes):**

1. Start a background check (`run_in_background`) that sleeps **10 minutes**, then runs `gh pr checks <number>` and `gh api repos/.../pulls/<number>/reviews`
2. If CI + reviews are ready → go to Phase 2
3. If not ready → sleep **5 minutes**, check again
4. Repeat 5-minute checks up to **30 minutes total** (10 + 5 + 5 + 5 + 5 = 30 min, 5 checks max)
5. If CI is still not done after 30 minutes → **stop polling and alert the user** — something is critically wrong with the build

**Phase 2 — Act on results:**

- **CI passed, reviews ready**: address review comments, commit and push fixes, then restart Phase 1
- **CI failed**: diagnose the failure, fix it, push, then restart Phase 1
- **CI passed, no review comments**: PR is ready for merge

**Rules:**

- **Never push during Phase 1** — wait for CI to finish before making changes
- **A push always restarts Phase 1** from the beginning (fresh 30-minute window)
- **30-minute hard cap** per CI run — if exceeded, escalate to user
- Use `run_in_background` bash parameter — no external scheduling needed
- This keeps session context alive (diff, files, PR number) so review comments can be fixed immediately

### Deploying to Production

- Merging to `main` triggers the deploy workflow automatically
- Deploy goes to VPS via SSH (PM2 + Caddy)
- Only one deploy runs at a time (concurrency group)
- Monitor the GitHub Actions tab for deploy status

## Security Rules

- Never commit `.env.local` or any file with secrets
- Never commit SSH private keys
- Secret scanning + push protection is enabled (will block pushes containing secrets)
- CodeQL runs on every PR — fix any security findings before merging
- Dependabot will open PRs for vulnerable dependencies — review and merge promptly

## Memory Backup

- Session memory snapshots are committed to `docs/memory/` via PR
- This provides version-controlled backup of project context
- Memory PRs follow the same branch/PR workflow as code changes
