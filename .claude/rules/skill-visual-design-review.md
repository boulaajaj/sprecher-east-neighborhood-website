# Visual Design Review

Mandatory design review for all UI/UX changes. This review runs as part of `/simplify` and catches visual quality issues before they reach the user.

**Inspired by**: [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (37K stars) prioritized rule system, [awesome-design-systems](https://github.com/alexpate/awesome-design-systems) (19K stars) QA patterns, and Vercel v0's design-token-first approach.

## When This Applies

Any diff that touches CSS, Tailwind classes, HTML structure, component markup, or image treatment. Skip for backend-only, config-only, or docs-only changes.

## Review Priority (Highest to Lowest)

| Priority | Category                   | Impact   | What to check                                                                               |
| -------- | -------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| 1        | **Contrast & Readability** | CRITICAL | Text legible on all backgrounds? Both themes? WCAG 4.5:1 minimum?                           |
| 2        | **Image Treatment**        | CRITICAL | Overlays subtle? Image stays vivid? Text readable via shadow/vignette, not heavy gradients? |
| 3        | **Section Transitions**    | HIGH     | Sections flow naturally? No harsh color boundaries? Short, soft feathers only?              |
| 4        | **Spacing & Rhythm**       | HIGH     | Consistent spacing scale? Generous whitespace? Related items grouped, sections separated?   |
| 5        | **Typography Hierarchy**   | HIGH     | Clear size/weight contrast? Max 3 font sizes per view? Line length under 75ch?              |
| 6        | **Color Harmony**          | MEDIUM   | Using design tokens, not hardcoded colors? Palette feels cohesive?                          |
| 7        | **Component Polish**       | MEDIUM   | Consistent border-radius? Hover/focus states? Shadow depth makes sense?                     |
| 8        | **Animation & Motion**     | LOW      | Transitions 150-300ms? No janky layout shifts? Respects prefers-reduced-motion?             |

## Image & Hero Treatment Rules

These are the most common source of "looks cheap" feedback. Follow strictly:

### DO (Professional Techniques)

- **Radial vignette** behind text — darkens only the area where text lives, keeps the rest of the image vivid and bright
- **Per-character text shadows** (`drop-shadow`) — creates a "fog" halo around each letter, readable on any background
- **Short bottom feather** (max 4rem, max 80% opacity) — a subtle softening at the section edge, not a full blend
- **Let the image breathe** — the photo is the hero; overlays should be invisible until you look for them

### DON'T (Amateur Tells)

- **Full-screen linear gradient** overlays (e.g., `from-black/80 via-black/50 to-black/30`) — kills the image, looks like a dark filter was dragged across it
- **100% blend into background** — the image should END with a crisp-ish edge, not dissolve completely into the page color
- **Tall gradient washes** (h-40, h-64) — makes the bottom of the hero look like a faded printout
- **Heavy uniform darkening** — if the whole image is dimmed equally, you've lost the photography

### The Correct Pattern

```tsx
{/* Centered radial vignette — darkens behind text area only */}
<div
  className="pointer-events-none absolute inset-0"
  style={{
    background:
      'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
  }}
/>

{/* Text with per-character shadow for universal readability */}
<h1 className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">...</h1>
<p className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">...</p>

{/* Subtle bottom feather — short, partial opacity */}
<div className="h-16 bg-gradient-to-b from-transparent to-background/80" />
```

## Section Transition Rules

- **Between hero and content**: Short feather (h-12 to h-16), partial opacity (60-80%). Never full opacity.
- **Between content sections**: Use alternating `bg-background` and `bg-surface` for visual separation. No gradients between sections.
- **Before footer**: A simple `border-t border-border` is usually enough. No gradient needed.

## Design Token Discipline

**ALWAYS use design tokens.** Never hardcode colors, even in inline styles.

| Instead of                    | Use                                                    |
| ----------------------------- | ------------------------------------------------------ |
| `rgba(0,0,0,0.5)` in overlays | Acceptable only for image scrims (no token equivalent) |
| `#3d7a5e`                     | `bg-primary` / `text-primary`                          |
| `#f9f8f5`                     | `bg-background`                                        |
| `gray-500`                    | `text-muted-foreground`                                |
| `border-gray-200`             | `border-border`                                        |

## The "First Impression" Test

For every UI change, ask these questions. If any answer is "no", fix it before pushing:

1. **3-second test**: Does the page look professional within 3 seconds? Would a resident trust this site?
2. **Squint test**: Squint at the screenshot — is there a clear visual hierarchy? Can you identify the primary, secondary, and tertiary elements?
3. **Comparison test**: Does this look as good as a modern city government site or a well-funded nonprofit? Not a student project?
4. **Theme test**: Does it look correct in BOTH light and dark mode? Any text disappearing?
5. **Edge test**: Are all edges clean? No harsh lines, no visible overlay boundaries, no unintended color bands?

## Visual QA Viewport Matrix

Screenshot every affected page at all 6 viewports. This is non-negotiable for UI changes.

| #   | Name      | Width  | Check for                                                   |
| --- | --------- | ------ | ----------------------------------------------------------- |
| 1   | Mobile S  | 320px  | Text wrapping, touch targets 44px+, no horizontal scroll    |
| 2   | Mobile L  | 430px  | Image aspect ratios, card layouts, button spacing           |
| 3   | Tablet S  | 768px  | Grid transitions (1-col to 2-col), nav breakpoint           |
| 4   | Tablet L  | 1024px | Content width, sidebar layouts, image sizing                |
| 5   | Desktop S | 1280px | Full nav visible, max-width constraints, spacing balance    |
| 6   | Desktop L | 1920px | Content not stretched, comfortable reading width, alignment |

## Anti-Patterns Checklist

Flag any of these as bugs requiring immediate fix:

- [ ] Text invisible or hard to read in either theme
- [ ] Gradient overlay that dims the entire hero image uniformly
- [ ] Bottom gradient taller than 4rem or at 100% opacity
- [ ] Hardcoded hex colors instead of design tokens
- [ ] Horizontal scrollbar at any viewport
- [ ] Touch target smaller than 44x44px on mobile
- [ ] Inconsistent border-radius within the same section
- [ ] Missing hover/focus states on interactive elements
- [ ] Content width exceeding 75ch for body text
- [ ] Empty space where content should be (empty sections, broken images)
- [ ] Orphaned single words on their own line in headings
- [ ] Raw unstyled HTML elements (inputs without focus rings, links without hover)
