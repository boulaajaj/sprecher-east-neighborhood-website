# Frontend Design Patterns — Implementation Library

Concrete Tailwind CSS and React patterns for building polished, modern UI. Every pattern here is tested, responsive, and uses the project's design tokens. When the designer recommends a visual effect, the builder pulls the implementation from here.

This is a living library. When a new pattern is proven in production, add it here.

## Design Philosophy

**This library is a floor, not a ceiling.** These patterns are proven starting points — use them, combine them, remix them, but never treat them as the only options. The best designs come from creative composition: a frosted glass panel with a subtle parallax background, an anchored hero with staggered text reveal, a split layout with a floating stat strip overlapping the fold.

**What we value:**

- **Minimalism with maximum impact** — every element earns its place; if it doesn't serve the user, remove it
- **Purposeful asymmetry** — visual weight should feel intentional, not accidental; perfect symmetry is boring, thoughtful imbalance is compelling
- **Smooth contextual flow** — each section should lead naturally to the next; the user should never wonder "why is this here?"
- **Intuitiveness for the layman** — a resident who has never built a website should find navigation, CTAs, and content hierarchy immediately obvious
- **Elegance over flashiness** — subtle shadows beat loud gradients; a 200ms ease-out beat a 500ms bounce; restraint is the mark of quality

**Creative freedom within constraints:**

- Stay within Tailwind CSS + Next.js — no external animation libraries unless justified
- Use design tokens from `globals.css @theme {}` for all colors
- Respect accessibility (contrast ratios, reduced motion, focus indicators)
- Test at 6 viewports (320, 430, 768, 1024, 1280, 1920px)
- Beyond these constraints: **experiment freely.** Combine patterns. Invent new ones. Add subtle shadows, micro-animations, unexpected but effective layout choices. If the result is clean, intuitive, and beautiful — ship it.

**When inventing something new:**

- Build it, screenshot it at all viewports, verify it works
- If it's good, add it to this library with a name, code snippet, and explanation of why it works
- The library grows through creative work, not through rules committees

## How to Use This File

1. **Designer identifies a problem** (e.g., "hero text is hard to read on the image")
2. **Designer prescribes a pattern from this library** (e.g., "use the Frosted Glass Text Panel")
3. **Builder copies the snippet, adapts it to the component, and ships it**

The designer SHOULD reference patterns by name and include the specific snippet. The builder SHOULD NOT invent visual effects from scratch when a pattern exists here — but IS encouraged to combine, adapt, and extend patterns creatively.

---

## Hero Patterns

### Pattern: Anchored Hero (Text Bottom-Left)

Instead of centering everything in a tall void, anchor content to the bottom-left. Creates visual weight and a natural reading entry point.

```tsx
<div className="relative -mt-[10.4rem] min-h-[80vh]">
  {/* Background image */}
  <div className="absolute inset-0">
    <Media fill imgClassName="object-cover" priority resource={media} />
  </div>

  {/* Gradient scrim — darkens bottom where text lives */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

  {/* Content anchored to bottom-left */}
  <div className="relative z-10 container flex min-h-[80vh] items-end pb-16 md:pb-20">
    <div className="max-w-2xl">
      <h1 className="text-4xl leading-tight font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
        Your Neighborhood, Your Community
      </h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/85 md:text-xl">
        Connecting residents on Madison's Far East Side since 2006.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl">
          Upcoming Events
        </a>
        <a className="rounded-lg border-2 border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
          Get Involved
        </a>
      </div>
    </div>
  </div>
</div>
```

**Why it works:** The eye enters at the bottom-left naturally. The gradient only darkens where text lives, keeping the top of the image vivid. Content has a clear anchor point instead of floating.

**Responsive behavior:** Text stack is left-aligned at all breakpoints. On mobile, `pb-16` gives breathing room above the fold line.

---

### Pattern: Frosted Glass Text Panel

Place hero text on a frosted glass card that sits on top of the image. Text is always legible regardless of image content.

```tsx
<div className="relative -mt-[10.4rem] min-h-[80vh]">
  {/* Background image — stays vivid */}
  <div className="absolute inset-0">
    <Media fill imgClassName="object-cover" priority resource={media} />
  </div>

  {/* Subtle overall scrim so the glass panel doesn't float in brightness */}
  <div className="absolute inset-0 bg-black/20" />

  {/* Content in frosted glass panel */}
  <div className="relative z-10 container flex min-h-[80vh] items-end pb-16 md:items-center md:pb-0">
    <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md md:p-12">
      <h1 className="text-3xl leading-tight font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
        Your Neighborhood, Your Community
      </h1>
      <p className="mt-4 text-base leading-relaxed text-white/90 md:text-lg">
        Connecting residents on Madison's Far East Side since 2006.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90">
          Upcoming Events
        </a>
        <a className="rounded-lg border border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
          Get Involved
        </a>
      </div>
    </div>
  </div>
</div>
```

**Key CSS:** `backdrop-blur-md` (12px blur) + `bg-white/10` (10% white) + `border border-white/20`. The blur makes the panel feel physical without hiding the image.

**Browser support:** `backdrop-filter` is supported in all modern browsers. Safari 9–17 requires the `-webkit-backdrop-filter` prefix; Safari 18+ supports the unprefixed property. For maximum compatibility, include both in `globals.css` if targeting older Safari versions.

**Responsive:** Panel is full-width on mobile (anchored to bottom with `items-end`), centered on desktop (`md:items-center`).

---

### Pattern: Split Hero (Text Left, Image Right)

For heroes without a full-bleed background image. Text occupies 50-60% of the width, image fills the rest.

```tsx
<div className="container py-16 md:py-24">
  <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
    {/* Text side — always left */}
    <div>
      <span className="text-xs font-bold tracking-widest text-primary uppercase">
        Sprecher East
      </span>
      <h1 className="mt-3 text-4xl leading-tight font-bold tracking-tight text-foreground md:text-5xl">
        Your Neighborhood, Your Community
      </h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
        A grassroots neighborhood initiative connecting residents of Meadowlands, Door Creek, and
        Reston Heights since 2006.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90">
          Upcoming Events
        </a>
        <a className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition hover:bg-primary/10">
          Get Involved
        </a>
      </div>
    </div>

    {/* Image side */}
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
      <Media fill imgClassName="object-cover" resource={media} />
    </div>
  </div>
</div>
```

**Why it works:** Asymmetric layout with clear visual weight distribution. Left side has the reading content, right side has the visual. The eye naturally scans left-to-right.

**Responsive:** Stacks vertically on mobile (image below text). On desktop, side-by-side.

---

## Text Readability on Images

### Pattern: Gradient Scrim (Bottom-Up)

When text sits at the bottom of an image. Darkens only the bottom portion.

```css
/* Bottom-anchored text */
.scrim-bottom {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    transparent 70%
  );
}
```

Tailwind equivalent:

```css
bg-gradient-to-t from-black/70 via-black/30 to-transparent
```

### Pattern: Gradient Scrim (Left Side)

When text sits on the left with image visible on the right.

```css
bg-gradient-to-r from-black/70 via-black/40 to-transparent
```

### Pattern: Text Shadow Stack

For text directly on images without a scrim. Use multiple shadows for a soft halo effect.

```css
.hero-text-readable {
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.2);
}
```

In Tailwind (using arbitrary `text-shadow` value):

```css
[text-shadow:0_1px_3px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.2)]
```

Or add to `globals.css`:

```css
.hero-text-readable {
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.2);
}
```

---

## Section Transition Patterns

### Pattern: Background Alternation

Sections must alternate between `bg-background` and `bg-surface` to create visual rhythm. Never use the same background on consecutive sections.

```text
Section 1 (Hero):     dark / full-bleed image
Section 2 (Content):  bg-background
Section 3 (Cards):    bg-surface
Section 4 (News):     bg-background
Section 5 (CTA):      bg-primary gradient
Section 6 (Footer):   dark
```

### Pattern: Angled Section Divider

A subtle angle between sections creates visual flow without hard horizontal lines.

```tsx
<section className="relative bg-surface py-16 md:py-24">
  {/* Angled top edge */}
  <div className="absolute inset-x-0 -top-8 h-16 -skew-y-1 bg-surface" />
  <div className="relative container">{/* Section content */}</div>
</section>
```

**How it works:** A skewed div extends above the section, creating a diagonal transition from the previous section. The `-top-8` positions it to overlap.

### Pattern: Fade Overlap

A gradient at the bottom of one section that fades into the next. Already used on the hero — extend this to other section boundaries.

```tsx
{
  /* At the bottom of any section */
}
;<div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
```

---

## Card Patterns

### Pattern: Stat Card (Icon + Number + Label)

For feature/stat strips. More visually engaging than text-only cards.

```tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
  {stats.map((stat) => (
    <div key={stat.label} className="rounded-2xl border border-border bg-card p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <stat.icon className="h-6 w-6 text-primary" />
      </div>
      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
    </div>
  ))}
</div>
```

**Why it works:** The icon gives each card visual identity. The colored icon container creates a focal point. Number + label is scannable in under a second.

### Pattern: Feature Card (Horizontal with Icon)

For content sections where each item has a heading and description.

```tsx
<div className="flex gap-4">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
    <Icon className="h-5 w-5 text-primary" />
  </div>
  <div>
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
  </div>
</div>
```

---

## Scroll Animations

### Pattern: Fade-In on Scroll

Using CSS-only `@starting-style` (modern browsers) or Intersection Observer for broader support.

**CSS approach (add to globals.css):**

```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(1.5rem);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**React hook (client component):**

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}
```

**Usage:**

```tsx
function Section() {
  const { ref, isVisible } = useScrollReveal()
  return (
    <div ref={ref} className={`animate-on-scroll ${isVisible ? 'is-visible' : ''}`}>
      {/* Content fades in when scrolled into view */}
    </div>
  )
}
```

**Reduced motion:** Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

### Pattern: Staggered Card Reveal

Cards in a grid appear one after another with a slight delay. Each card is wrapped in a dedicated component to respect React's Rules of Hooks.

```tsx
function RevealCard({ card, index }: { card: CardProps; index: number }) {
  const { ref, isVisible } = useScrollReveal()
  const delayClass = ['delay-0', 'delay-100', 'delay-200', 'delay-300', 'delay-[400ms]'][
    Math.min(index, 4)
  ]
  return (
    <div ref={ref} className={`animate-on-scroll ${delayClass} ${isVisible ? 'is-visible' : ''}`}>
      <Card {...card} />
    </div>
  )
}

{
  /* Usage */
}
{
  cards.map((card, i) => <RevealCard key={card.id} card={card} index={i} />)
}
```

**Rule:** Max delay of 400ms (4 cards). Beyond that, everything after the 4th card should appear at the same time. Uses Tailwind delay utilities instead of inline styles.

---

## Parallax Patterns

### Pattern: Subtle Background Parallax

The background image moves slower than the scroll, creating depth. Uses the project's `<Media />` component with a CSS parallax class defined in `globals.css`.

Add to `globals.css`:

```css
.parallax-bg {
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
}

/* iOS Safari doesn't support background-attachment: fixed — fall back to static */
@media (hover: none) and (pointer: coarse) {
  .parallax-bg {
    background-attachment: scroll;
  }
}
```

```tsx
<section className="relative overflow-hidden py-24">
  {/* Parallax background */}
  <div className="absolute inset-0 -top-[20%] -bottom-[20%]">
    <Media fill imgClassName="object-cover" resource={media} />
  </div>
  <div className="absolute inset-0 bg-black/40" />
  <div className="relative z-10 container text-white">{/* Content */}</div>
</section>
```

**Key CSS:** The oversized container (`-top-[20%] -bottom-[20%]`) prevents gaps during scroll. For true CSS parallax with background images, use the `.parallax-bg` class on a div with `background-image` set via a CSS custom property.

**Mobile note:** `background-attachment: fixed` doesn't work on iOS Safari. The `@media (hover: none) and (pointer: coarse)` query targets touch devices more reliably than `-webkit-touch-callout` feature detection. On mobile, the image is static — which is fine for small screens.

### Pattern: JS-Based Smooth Parallax

For more control over parallax speed and direction. Client component. Uses `requestAnimationFrame` to avoid scroll jank.

```tsx
'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

export function ParallaxImage({ src, speed = 0.3 }: { src: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let ticking = false

    function update() {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const offset = rect.top * speed
      el.style.transform = `translateY(${offset}px)`
      ticking = false
    }

    function handleScroll() {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div className="absolute inset-0 -top-[15%] -bottom-[15%] overflow-hidden">
      <div ref={ref} className="h-full w-full">
        <Image src={src} alt="" fill className="object-cover" />
      </div>
    </div>
  )
}
```

**Speed values:** `0.2` = subtle, `0.3` = noticeable, `0.5` = dramatic. Default to `0.3`.

---

## Glassmorphism Components

### Pattern: Glass Card

A frosted glass card for overlays, modals, or floating content.

```tsx
<div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md">
  {/* Card content */}
</div>
```

**Dark variant (on dark backgrounds):**

```tsx
<div className="rounded-2xl border border-white/10 bg-black/20 p-6 shadow-xl backdrop-blur-md">
  {/* Card content */}
</div>
```

**Colored variant (brand tint):**

```tsx
<div className="rounded-2xl border border-primary/20 bg-primary/10 p-6 shadow-xl backdrop-blur-md">
  {/* Card content */}
</div>
```

### Pattern: Glass Navigation Bar

Frosted glass header that shows content scrolling beneath.

```tsx
<header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-lg">
  <nav className="container flex h-16 items-center justify-between">{/* Nav content */}</nav>
</header>
```

**Key:** `bg-background/80` (80% opacity of the background token) + `backdrop-blur-lg` (16px blur). The border adds a subtle edge.

---

## CTA Section Patterns

### Pattern: Gradient CTA with Texture

More visually interesting than a flat gradient.

```tsx
<section
  className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/70 py-16 md:py-24"
  data-theme="dark"
>
  {/* Subtle texture overlay — uses Tailwind arbitrary values, no inline styles */}
  <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px] opacity-10" />

  <div className="relative container">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-bold text-white md:text-4xl">Join Your Neighbors</h2>
      <p className="mt-4 text-lg text-white/85">
        Whether you've lived here for years or just moved in, there's a place for you.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a className="rounded-lg bg-white px-6 py-3 font-semibold text-primary transition hover:bg-white/90">
          Get Involved
        </a>
        <a className="rounded-lg border-2 border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
          Contact Us
        </a>
      </div>
    </div>
  </div>
</section>
```

**The texture:** A dot grid pattern at 10% opacity adds visual interest without distracting. The `radial-gradient` trick creates a repeating dot pattern with pure CSS — no image file needed.

### Pattern: CTA with Background Image

For CTAs that want more visual impact than a solid color.

```tsx
<section className="relative overflow-hidden py-16 md:py-24">
  <div className="absolute inset-0">
    <Image src={bgUrl} alt="" fill className="object-cover" />
  </div>
  <div className="absolute inset-0 bg-primary/85" />
  <div className="relative container text-center text-white">{/* CTA content */}</div>
</section>
```

**Key:** `bg-primary/85` overlays the brand color at 85% opacity over the image. The image adds texture without competing with the text.

---

## Responsive Layout Recipes

### Two-Column Content + Image

The most common section layout. Text left, visual right. Reverses on alternate sections.

```tsx
{
  /* Normal order */
}
;<div className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
  <div>{/* Text content */}</div>
  <div>{/* Image/visual */}</div>
</div>

{
  /* Reversed (image left, text right) — for alternating sections */
}
;<div className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
  <div className="order-2 md:order-1">{/* Image/visual */}</div>
  <div className="order-1 md:order-2">{/* Text content */}</div>
</div>
```

**Mobile:** Always text first, image second (regardless of desktop order). This is why `order-1`/`order-2` is used.

### Three-Column Card Grid

```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

**Breakpoint behavior:** 1 column on mobile, 2 on tablet, 3 on desktop. Gap increases at `lg`.

### Four-Column Stat Grid

```tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
  {stats.map((stat) => (
    <StatCard key={stat.label} {...stat} />
  ))}
</div>
```

**Breakpoint behavior:** 2x2 grid on mobile, 4-across on tablet+.

---

## Section Backdrop Patterns

### Pattern: Faded Photo Backdrop

A section background photo at very low opacity — adds warmth and context without competing with content. The photo is felt, not seen.

```tsx
<section className="relative overflow-hidden bg-surface py-16 md:py-24">
  {/* Backdrop photo — extremely subtle */}
  <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
    <Image src={backdropUrl} alt="" fill className="object-cover" />
  </div>
  {/* Optional: tinted overlay to blend photo into section bg color */}
  <div className="pointer-events-none absolute inset-0 bg-surface/60" />

  <div className="relative z-10 container">{/* Section content */}</div>
</section>
```

**Key:** `opacity-[0.06]` (6%) makes the image almost subliminal — you feel texture without consciously seeing the photo. The `bg-surface/60` overlay tints the image to match the section color so it doesn't clash.

**Tuning:** `0.04` = barely visible ghost, `0.06` = subtle texture, `0.10` = clearly visible backdrop, `0.15` = prominent (too much for most sections). Start at `0.06`.

**Dark mode:** Use `opacity-[0.04]` on dark backgrounds — dark sections need less image opacity to feel textured.

### Pattern: Tinted Photo Strip

A full-bleed section where a photo is visible but tinted with the brand color. More prominent than a backdrop — used for section dividers or visual breaks.

```tsx
<section className="relative overflow-hidden py-16 md:py-24">
  <div className="absolute inset-0">
    <Image src={photoUrl} alt="" fill className="object-cover" />
  </div>
  {/* Brand tint — photo visible but color-matched to the site */}
  <div className="absolute inset-0 bg-primary/80" />
  <div className="relative z-10 container text-white">{/* Content */}</div>
</section>
```

**Variants:**

- `bg-primary/80` — strong brand tint, text is white
- `bg-background/85` — soft wash, text stays dark (foreground)
- `bg-gradient-to-r from-primary/90 to-primary/70` — gradient tint reveals more image on one side

---

## Section Backdrop Photo Guide

Placeholder photos to use per section until real neighborhood photos are available. Source from Unsplash (free, no attribution required for web use). Store in `public/images/backdrops/`.

| Section            | Photo Subject                                   | Mood                              | File Name                 |
| ------------------ | ----------------------------------------------- | --------------------------------- | ------------------------- |
| Hero               | Aerial suburban neighborhood, green trees       | Warm, welcoming, expansive        | `hero-neighborhood.jpg`   |
| About              | Tree-lined residential street                   | Calm, established, inviting       | `about-street.jpg`        |
| Parks & Recreation | Green park with walking path or playground      | Active, natural, family-friendly  | `parks-greenspace.jpg`    |
| Community          | Diverse group of neighbors at outdoor gathering | Connected, joyful, inclusive      | `community-gathering.jpg` |
| Housing            | Suburban homes with yards, warm light           | Stable, comfortable, aspirational | `housing-homes.jpg`       |
| News/Updates       | Coffee table with newspaper, morning light      | Informed, local, current          | `news-morning.jpg`        |
| Get Involved / CTA | Hands together or group volunteering            | Active, united, purposeful        | `cta-volunteers.jpg`      |
| Events             | Outdoor festival or farmers market              | Lively, seasonal, fun             | `events-market.jpg`       |
| Resources          | Library, books, or community center interior    | Helpful, organized, accessible    | `resources-library.jpg`   |

**Downloading:** Use Unsplash Source URLs for development. For production, download and self-host to avoid external dependencies:

```bash
# Example: download a neighborhood photo from Unsplash
curl -L "https://unsplash.com/photos/{photo-id}/download?w=1920" -o public/images/backdrops/hero-neighborhood.jpg
```

**Photo treatment rules:**

- Always download at 1920px width (matches largest viewport)
- Compress with quality 80 — backdrops don't need sharpness since they're displayed at low opacity
- Use `object-cover` so photos fill their container without distortion
- All backdrop images get `alt=""` (decorative, not informational)
- When real neighborhood photos replace placeholders, keep the same file names so no code changes are needed

---

## Debugging Visual Issues

### Checklist: "Why Does This Section Look Wrong?"

1. **Is the text centered when it shouldn't be?** Check for `text-center` or `justify-center` on containers with multi-sentence text. Remove it — left-align the text and add a visual element to balance the layout.

2. **Is there too much empty space?** Check `min-h-[Xvh]` values. If the content doesn't fill the height, either reduce the min-height or anchor content to one edge (top or bottom) instead of centering.

3. **Are consecutive sections the same background color?** Check the background classes. Alternate between `bg-background` and `bg-surface`. Use `bg-primary` gradient for CTA sections to break the pattern.

4. **Is the content too narrow or too wide?** Check `max-w-*` values. Headings can be wider (`max-w-3xl`), body text should be narrower (`max-w-prose` or `max-w-lg`). Cards grids should use the full container width.

5. **Are cards missing visual differentiation?** Check if all cards look identical. Add icons, category colors, or image treatments to differentiate them.

6. **Is the hover state missing or too subtle?** Every interactive element needs a visible hover state. Use `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200` for cards, `hover:bg-primary/90` for buttons.

7. **Does the section have a clear eyebrow → heading → body → CTA hierarchy?** If not, add an eyebrow label (`text-xs font-bold uppercase tracking-widest text-primary`) and ensure the heading is significantly larger than the body text.

### Viewport Testing Quick Reference

| Viewport  | Width  | What to check                                                          |
| --------- | ------ | ---------------------------------------------------------------------- |
| Mobile S  | 320px  | Text wrapping, touch targets (44px min), no horizontal overflow        |
| Mobile L  | 430px  | Same as above, verify nothing breaks at slightly wider mobile          |
| Tablet    | 768px  | Grid columns transition, image aspect ratios, nav layout               |
| Tablet L  | 1024px | Desktop layout kicks in, spacing feels balanced                        |
| Desktop   | 1280px | Full layout, nothing feels too wide or too narrow                      |
| Desktop L | 1920px | Content centered, no ultra-wide stretching, max-width constraints work |

---

## Anti-Patterns to Flag

These are specific implementation mistakes the designer should catch and prescribe fixes for:

| Anti-Pattern        | What You See                                         | Fix                                                                     |
| ------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| Centered void       | Text floating in the middle of a tall empty space    | Anchor to bottom or side, reduce height, or add visual elements         |
| Centered paragraph  | Multi-sentence text with `text-center`               | Remove `text-center`, add `max-w-prose`, left-align                     |
| Uniform cards       | All cards identical with no visual differentiation   | Add icons, images, or color accents per card                            |
| Consecutive same-bg | Two sections with same background color              | Alternate `bg-background`/`bg-surface`, or insert a colored divider     |
| Giant min-height    | `min-h-[80vh]` with 3 lines of content               | Reduce to `min-h-[60vh]` or use `py-24` instead                         |
| Missing scrim       | White text on bright image with no gradient          | Add `bg-gradient-to-t from-black/60` below text area                    |
| Template buttons    | Generic "Learn More" or "Get Started"                | Use specific action words: "See Upcoming Events", "Join the Discussion" |
| Orphan section      | A section with heading + one sentence + nothing else | Merge with adjacent section or add supporting content                   |
