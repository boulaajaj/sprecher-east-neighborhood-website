# Security Guidelines

## Agent Security Rules (MUST follow during development)

### Before adding any new package

1. Check the package on npm — look at weekly downloads, last publish date, and maintainer count
2. Prefer packages that are widely used (>1M weekly downloads) and actively maintained (<6 months since last publish)
3. Run `npm audit` after every `npm install` — if new vulnerabilities appear, fix them before committing
4. Avoid packages with known CVEs. If a CVE exists, check if a patched version is available first
5. Prefer built-in Node.js/Next.js features over third-party packages when possible (fewer deps = smaller attack surface)

### When writing code

- Never use `eval()`, `Function()` constructor, or `dangerouslySetInnerHTML` directly — use safe shared wrappers instead (e.g., `JsonLd` component for structured data). Input that seems trusted today can become untrusted as the codebase evolves.
- Never interpolate user input into SQL, shell commands, or URLs — always use parameterized/template-safe methods
- Validate and sanitize all user input at system boundaries (API routes, form handlers)
- Use `encodeURIComponent()` when building URLs from user input
- Never log sensitive data (passwords, tokens, API keys, PII) — even in dev
- Use `overrideAccess: true` only in server-side Payload reads (never expose raw Payload queries to the client)
- Set appropriate CORS headers on API routes
- Never disable TypeScript strict checks or ESLint security rules to make code compile

### No PII in source code

- Never hardcode real email addresses, phone numbers, or personal names in source files
- Use environment variables for all email addresses (sender, recipient, reply-to)
- `.env.local.example` must use placeholder values (`you@example.com`, `no-reply@example.com`) — never real addresses
- Console logs must never include user-submitted PII (names, emails, addresses) — log only non-identifying metadata (subject, message length, timestamp)
- Sanitize user input before placing it in email headers — strip CR/LF and control characters to prevent header injection
- When validating select/dropdown values server-side, whitelist the allowed values — never trust client-submitted strings
- Seed data passwords must use `process.env.SEED_PASSWORD || crypto.randomUUID()` — never hardcode passwords like `'password'`
- All seed email addresses must use `@example.com` domain — never use real addresses

### When handling auth and sessions

- `PAYLOAD_SECRET` must be a strong random string (32+ chars) for JWT signing
- Payload handles session cookies natively via httpOnly JWT cookies
- Payload's built-in access control protects routes and data — never bypass `authenticatedOrPublished`
- Never store tokens or secrets in localStorage — use httpOnly cookies (Payload handles this)
- Never expose user roles or permissions in client-side JavaScript beyond what's needed for UI
- **Ownership-scoped access control**: Any collection where users can modify their own records must enforce ownership checks in `access.update` — never use a blanket `authenticated` for update access on user-facing collections. Use `authenticatedSelf` from `src/access/authenticatedSelf.ts` or a custom function that compares `req.user.id` to the record `id`. A broad `authenticated` on update means any logged-in user can modify any record.

### Secrets management

- All secrets go in `.env.local` (gitignored, never committed)
- System-level env vars (like `HOSTINGER_API_KEY`) are set in the OS, not in files
- Never hardcode API keys, passwords, or tokens in source code
- Use `process.env.VAR_NAME` to access secrets at runtime
- Before every commit, check staged files for accidental secrets (API keys, passwords, connection strings)

## Dependency Security Guardrails

Four layers of protection against vulnerable dependencies:

1. **Agent rules** (during development): Check packages before installing, run audit after install, fix before committing
2. **Pre-commit hook** (local): `npm audit --audit-level=high --omit=dev` warns if production deps have high/critical vulnerabilities
3. **CI pipeline** (PR gate): `npm audit --audit-level=high --omit=dev` blocks merging if any high/critical production vulnerabilities are found
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
- **NEVER overwrite `/etc/caddy/Caddyfile`** — always read it first, then ADD new server blocks
- Always back up before editing: `cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak`
- Always validate before reloading: `caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy`
- Live domains (`sprecher-east.org`, `www.sprecher-east.org`) must NEVER be removed from the Caddyfile

## GitHub Security Features (Active)

- Secret scanning: detects leaked credentials in commits
- Push protection: blocks pushes containing secrets
- Dependabot alerts: flags vulnerable dependencies
- Dependabot security updates: auto-PRs for vulnerable deps
- Dependabot grouping: patches and minors batched to reduce PR noise
- CodeQL: semantic code analysis on every PR
- Dependency audit: CI blocks PRs with high/critical npm vulnerabilities
