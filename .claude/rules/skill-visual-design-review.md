# Visual Design Review

Mandatory design review for all UI/UX changes. This rule ensures the `/visual-design-review` skill is invoked before any frontend PR.

## When This Applies

Any diff that touches CSS, Tailwind classes, HTML structure, component markup, or image treatment. Skip for backend-only, config-only, or docs-only changes.

## How It Works

The `/visual-design-review` skill acts as a design director. It:

1. Screenshots affected pages at 6 viewports (320, 430, 768, 1024, 1280, 1920) in both light and dark themes
2. Evaluates visual quality using principle-based taste (Apple/Linear/Stripe caliber)
3. Produces findings with severity, design specs, and **fix strategies anchored to the project's brand**
4. Outputs a grouped **Implementation Plan** with tasks, affected files, design tokens, effort estimates
5. Recommends patterns to codify in the design system

## What It Does

- Reviews visuals from screenshots at multiple viewports and themes
- **Prescribes specific fixes from the pattern library** (`skill-frontend-patterns.md`) — every finding includes the pattern name and code snippet to implement the fix
- Reads source code when needed to understand what classes/markup are producing the visual issue
- Evolves the existing design within brand rails

## What It Does NOT Do

- Redesign the site from scratch — it improves within the existing brand and layout system

## Review Priority (Highest to Lowest)

| Priority | Category               | Impact   |
| -------- | ---------------------- | -------- |
| 1        | Contrast & Readability | CRITICAL |
| 2        | Image Treatment        | CRITICAL |
| 3        | Section Transitions    | HIGH     |
| 4        | Spacing & Rhythm       | HIGH     |
| 5        | Typography Hierarchy   | HIGH     |
| 6        | Color Harmony          | MEDIUM   |
| 7        | Component Polish       | MEDIUM   |
| 8        | Animation & Motion     | LOW      |

## Design Token Discipline

Always use design tokens from `globals.css @theme {}`. Never hardcode colors (exception: `rgba(0,0,0,...)` for image scrims/shadows where no token equivalent exists). The skill guides this in its recommendations — every fix strategy references project tokens by name.

## Finding Format

Every finding must include:

1. **Severity** — CRITICAL / HIGH / MEDIUM / LOW
2. **What's wrong** — Visual description of the problem
3. **Pattern to apply** — Name of the pattern from `skill-frontend-patterns.md` (e.g., "Anchored Hero", "Frosted Glass Text Panel", "Background Alternation")
4. **Code snippet** — The exact Tailwind/CSS/JSX from the pattern library, adapted to the specific component
5. **Files to change** — Which source files need the edit

If no existing pattern fits the problem, the reviewer must **write a new pattern** with a tested implementation and add it to `skill-frontend-patterns.md` before prescribing it.

## Integration

This review runs automatically as part of `/simplify` (the visual design agent). It can also be invoked standalone via `/visual-design-review` for focused design audits. Fix all Critical and High findings before creating a PR.
