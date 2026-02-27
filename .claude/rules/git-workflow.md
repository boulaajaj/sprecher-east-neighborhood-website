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

### Creating a Pull Request

1. Push the branch: `git push -u origin <branch-name>`
2. Create a **Draft PR** if work is incomplete
3. PR description must include:
   - **Summary**: What changed and why (2-3 bullet points)
   - **Role**: Which agent profile made the changes (e.g., `[C-Builder]`)
   - **Test plan**: How to verify the changes work
4. Wait for CI checks (type-check, build, CodeQL) to pass
5. Review the diff — if you can't explain the code, it doesn't ship
6. Merge via PR (squash merge preferred for clean history)

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
