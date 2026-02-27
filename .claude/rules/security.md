# Security Guidelines

## Agent Security Rules (MUST follow during development)

### Before adding any new package

1. Check the package on npm — look at weekly downloads, last publish date, and maintainer count
2. Prefer packages that are widely used (>1M weekly downloads) and actively maintained (<6 months since last publish)
3. Run `npm audit` after every `npm install` — if new vulnerabilities appear, fix them before committing
4. Avoid packages with known CVEs. If a CVE exists, check if a patched version is available first
5. Prefer built-in Node.js/Next.js features over third-party packages when possible (fewer deps = smaller attack surface)

### When writing code

- Never use `eval()`, `Function()` constructor, or `dangerouslySetInnerHTML` with user input
- Never interpolate user input into SQL, shell commands, or URLs — always use parameterized/template-safe methods
- Validate and sanitize all user input at system boundaries (API routes, form handlers)
- Use `encodeURIComponent()` when building URLs from user input
- Never log sensitive data (passwords, tokens, API keys, PII) — even in dev
- Use `overrideAccess: true` only in server-side Payload reads (never expose raw Payload queries to the client)
- Set appropriate CORS headers on API routes
- Never disable TypeScript strict checks or ESLint security rules to make code compile

### When handling auth and sessions

- `PAYLOAD_SECRET` and `BETTER_AUTH_SECRET` must be different values (both 32+ random chars)
- Better Auth uses `nextCookies()` plugin for secure cookie handling in Next.js 15
- Middleware at `src/middleware.ts` protects authenticated routes — never bypass it
- Never store tokens or secrets in localStorage — use httpOnly cookies (Better Auth handles this)
- Never expose user roles or permissions in client-side JavaScript beyond what's needed for UI

### Secrets management

- All secrets go in `.env.local` (gitignored, never committed)
- System-level env vars (like `HOSTINGER_API_KEY`) are set in the OS, not in files
- Never hardcode API keys, passwords, or tokens in source code
- Use `process.env.VAR_NAME` to access secrets at runtime
- Before every commit, check staged files for accidental secrets (API keys, passwords, connection strings)

## Dependency Security Guardrails

Three layers of protection against vulnerable dependencies:

1. **Agent rules** (during development): Check packages before installing, run audit after install, fix before committing
2. **Pre-commit hook** (local): `npm audit --audit-level=high --omit=dev` warns if production deps have high/critical vulnerabilities
3. **CI pipeline** (PR gate): `npm audit --audit-level=high` blocks merging if any high/critical vulnerabilities are found
4. **Dependabot** (ongoing): Weekly scans with grouped PRs — patches batched together, majors get individual PRs

When fixing transitive vulnerabilities:

- Use `overrides` in package.json scoped to the parent package (not global overrides)
- Dismiss unfixable alerts with a clear comment explaining why (e.g., dev-only, no upstream fix available)
- Document any overrides in PR description so reviewers understand the tradeoff

## Infrastructure Security

- SSH key-based auth only on VPS (no password auth)
- Caddy handles SSL/TLS automatically when domain is configured
- PM2 runs the app as a managed process (auto-restart on crash)
- GitHub Actions secrets store VPS credentials (never in code)

## GitHub Security Features (Active)

- Secret scanning: detects leaked credentials in commits
- Push protection: blocks pushes containing secrets
- Dependabot alerts: flags vulnerable dependencies
- Dependabot security updates: auto-PRs for vulnerable deps
- Dependabot grouping: patches and minors batched to reduce PR noise
- CodeQL: semantic code analysis on every PR
- Dependency audit: CI blocks PRs with high/critical npm vulnerabilities
