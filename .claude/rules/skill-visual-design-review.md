# Visual Design Review

Mandatory design review for all UI/UX changes. This rule ensures the `/visual-design-review` skill is invoked before any frontend PR.

## When This Applies

Any diff that touches CSS, Tailwind classes, HTML structure, component markup, or image treatment. Skip for backend-only, config-only, or docs-only changes.

## How It Works

The visual design review skill at `~/.claude/skills/visual-design-review/SKILL.md` acts as a design director. It:

1. Screenshots affected pages at 5 viewports (320, 768, 1024, 1280, 1920) in both light and dark themes
2. Evaluates visual quality using principle-based taste (Apple/Linear/Stripe caliber)
3. Produces findings with severity, design specs, and **fix strategies anchored to the project's brand**
4. Outputs a grouped **Implementation Plan** with tasks, affected files, design tokens, effort estimates
5. Recommends patterns to codify in the design system

## What It Does NOT Do

- Read source code (.tsx, .jsx files) — it reviews visuals only
- Prescribe specific CSS classes or Tailwind values — it speaks in design language
- Redesign the site — it evolves the existing design within brand rails

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

Always use design tokens from `globals.css @theme {}`. Never hardcode colors. The skill enforces this in its recommendations — every fix strategy references project tokens by name.

## Integration

This review runs automatically as part of `/simplify` (the visual design agent). It can also be invoked standalone via `/visual-design-review` for focused design audits. Fix all Critical and High findings before creating a PR.
