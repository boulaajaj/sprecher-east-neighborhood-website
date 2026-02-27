# Security Guidelines

## Secrets Management

- All secrets go in `.env.local` (gitignored, never committed)
- System-level env vars (like `HOSTINGER_API_KEY`) are set in the OS, not in files
- Never hardcode API keys, passwords, or tokens in source code
- Use `process.env.VAR_NAME` to access secrets at runtime

## Code Security

- Validate all user input at system boundaries (forms, API routes)
- Use parameterized queries (Payload ORM handles this)
- Escape output to prevent XSS (React handles this by default)
- Set appropriate CORS headers on API routes
- Use `overrideAccess: true` only in server-side Payload reads (never expose to client)

## Auth Security

- `PAYLOAD_SECRET` and `BETTER_AUTH_SECRET` must be different values
- Both must be 32+ random characters
- Better Auth uses `nextCookies()` plugin for secure cookie handling
- Middleware protects authenticated routes (`/profile`)

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
- CodeQL: semantic code analysis on every PR
