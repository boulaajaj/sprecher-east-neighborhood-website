# Development Principles

Engineering principles for building and maintaining this codebase. These apply to all agent profiles.

## Framework First

Before writing custom code, check whether the framework already provides the capability. Payload CMS, Next.js, and their plugin ecosystems cover most common needs — authentication, email, forms, media, access control, search, SEO, redirects. Use official plugins, adapters, and built-in APIs. Custom code is a last resort, not a starting point.

When evaluating whether to build vs. use:

- Search the framework's documentation and plugin registry first
- Check for official examples or templates that solve the problem
- If a plugin exists, use it even if the custom solution seems simpler — the plugin will be maintained upstream

## SOLID Principles

- **Single Responsibility**: Each module, component, collection, and function does one thing well. A form handler validates and persists — it doesn't also send emails (that's a hook).
- **Open/Closed**: Extend behavior through hooks, plugins, and composition — not by modifying existing modules. Payload hooks and Next.js middleware are the extension points.
- **Liskov Substitution**: Data access functions return consistent shapes regardless of the underlying source. Components in `ui/` are interchangeable without breaking layouts.
- **Interface Segregation**: API responses and component props include only what the consumer needs. Use Payload's `select` and `depth` parameters. Don't pass entire objects when 3 fields suffice.
- **Dependency Inversion**: Business logic depends on abstractions (Payload Local API, data layer interfaces), not concrete implementations (raw SQL, direct file reads).

## Domain-Driven Design

The codebase follows DDD boundaries. Code belongs in the layer that matches its responsibility:

- `ui/` — Pure presentational primitives, no domain knowledge
- `features/{domain}/` — Domain-specific components composed from `ui/` primitives
- `sections/` — Full-page sections composed from `features/` and `ui/`
- `layout/` — App shell (Nav, Footer, UserMenu)
- `lib/` — Shared infrastructure (data access, auth, utilities)
- `payload/collections/` — CMS domain models with access control and hooks

ESLint boundary rules enforce import direction. Respect them.

## Test-Driven Development

Write tests before or alongside implementation. Focus on behavior, not implementation details.

- **API routes and access control**: Verify auth requirements, input validation, and error responses
- **Collection hooks**: Verify transformations (slug generation, defaults, computed fields)
- **Components**: Test interactive behavior (form validation, state changes, keyboard navigation)
- **Data layer**: Verify consistent output from both Payload and JSON fallback sources
- Use framework-native testing tools: Payload Local API for CMS tests, React Testing Library for components

## Configuration Over Code

Values that vary between environments or could change over time must not appear as literals in source code. This includes service URLs, email addresses, feature flags, API endpoints, and thresholds.

- Environment-specific values go in `.env.local` and are read via `process.env`
- Application constants that are shared across modules go in dedicated config or constants files
- CMS-configurable values (form fields, email templates, notification recipients) belong in the CMS admin, not in code

## Persist Before Side Effects

When handling user-submitted data, save it to the database before triggering side effects like sending emails, calling external APIs, or publishing messages. Side effects can fail — data loss is permanent.

The pattern: validate → persist → notify → respond. Payload's `afterChange` hooks enforce this naturally.

## Use the Type System

- When installing packages with separate type definitions (`@types/*`), verify that major versions are compatible
- Prefer packages that ship their own types over separate `@types/*` packages
- Never suppress TypeScript errors with `as any` or `@ts-ignore` — fix the underlying type issue

## Validate at Boundaries

All external input (API requests, form submissions, webhook payloads, URL parameters) must be validated at the point of entry. Use schema validation when the framework provides it (Payload collections have built-in field validation). Never rely on client-side validation alone.

## Single Source of Truth

Constants, configuration, enum values, and type definitions used in multiple places must be defined once and imported everywhere else. Duplication across files leads to silent inconsistency.

## Fail Explicitly

In production, operations should either succeed or fail clearly. Never return a success response when the operation didn't complete. Never silently swallow errors in production — log them and return an appropriate error status.

In development, failures should be visible and informative (console warnings, fallback UI with explanation).

## Respect Module Boundaries

The DDD architecture (`ui/` → `features/` → `sections/` → `layout/` → `app/`, with `lib/` as shared infrastructure) exists for a reason. ESLint boundary rules enforce import direction. When adding new code:

- Determine which architectural layer it belongs to
- Respect the import rules for that layer
- If something needs to be shared across layers, it belongs in `lib/`

## Keep Dependencies Lean

Before adding a new package:

- Check if the framework or an existing dependency already provides the capability
- Verify the package is actively maintained (recent publish, healthy download count)
- Run `npm audit` after installation
- Prefer well-established packages over newer alternatives with smaller ecosystems
