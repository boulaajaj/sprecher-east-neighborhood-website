# Proposed component set: shared components

Part of the [UI inventory](inventory.md) (#170), for epic #163.

> **Status: proposal.** The owner reviews this set, changes it if he wants, and approves it before
> any component is built. Nothing here is built yet. The owner closes #170 once he approves the
> set.

The set comes from the [element tables](inventory.md#the-files): every element maps to exactly one
component and variant ([coverage check](component-set-modules.md#coverage)). This page covers the
shared components; [component-set-modules.md](component-set-modules.md) covers the components that
belong to one business area, what isn't needed yet, and the coverage table.

## Rules every component follows

- **Where:** shared primitives in `src/platform/ui/`, the rich-text renderer in
  `src/platform/richtext/`, area components in a module's `ui/`
  ([architecture](../architecture/README.md#where-does-it-go)). One component per file, under 250
  lines.
- **Variants with `cva`**, named by purpose (`primary`, `muted`), never by colour. Colours come
  from semantic tokens only ([rule 9](../architecture/README.md#dependency-rules)).
- **Plain typed props.** No component imports Payload; it gets `ImageRef`, `RichTextValue` or the
  module's own types. CMS links go through one `resolveLink()` mapper into `href`, `label` and
  `external`.
- **Proven libraries behind our API:** Radix for behaviour (select, checkbox, dialog, accordion),
  react-hook-form with Zod for forms (epic #163).
- **Composition over flags:** `Card` is built from small parts; looks are variants, not booleans.
- **Accessible by default:** focus ring, 44 px touch targets on phones, labels linked to controls,
  errors announced, `aria-current` on the current page.

In the tables, **Elements** lists the inventory IDs each component covers, and **Today** says
what it replaces.

## Actions

| Component | Variants (`cva`)                                                                                                     | Props                                                                                                                                                                                              | Today                                                                                                                                                           | Elements                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Button`  | `variant`: `primary`, `secondary`, `accent`, `ghost`, `inverse`, `inverse-outline`; `size`: `sm`, `md`, `lg`, `icon` | `href` (renders a link), `external` (new tab plus a hidden "opens in a new tab"), `loading` (spinner, `aria-busy`, same width), `fullWidth` (`true` or `'mobile'`), `iconStart`, `iconEnd`, `type` | `src/components/ui/button.tsx`, plus eight hand-built buttons ([D1](evidence.md#duplication)). Drops `destructive` (unused, unreadable) and `link` (now `Link`) | N7–N9, H2, H3, C16, C18, B7, B12, B14, B15, F14, F15, F21, F24, S7, S10, S11 |
| `Link`    | `variant`: `inline`, `nav`, `muted`, `action`, `skip`; `size`: `sm`, `md` (for `nav`)                                | `href`, `external`, `current` (sets `aria-current` and the active look), `icon`, `iconPosition`, `iconOnly` (the label becomes the `aria-label`)                                                   | `CMSLink` with `appearance="inline"` or `"link"`, raw `<a>` in four places, nav classes in `src/Header/Nav/index.tsx`                                           | L1, N1–N6, N11, N14, N17–N20                                                 |

**`Button · {appearance}` (B12).** The CMS link field stores `appearance` as `default` or
`outline` (`src/fields/link.ts:10`, `:14`). `default` maps to `Button · primary` and `outline` to
`Button · secondary`. The high-impact hero and the CTA block ignore the field today and style their
buttons by position (H2, H3, B14, B15).

## Form fields

| Component       | Variants (`cva`)                                                            | Props                                                                                                                                                                      | Today                                                                                                    | Elements                  |
| --------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------- |
| `Field`         | `layout`: `stacked`, `inline`; `width`: `full`, `half`                      | `label`, `hideLabel`, `required` (mark plus hidden "required"), `hint`, `error` (`role="alert"`, linked by `aria-describedby`, sets `aria-invalid`)                        | label, required mark, `Error` and `Width` copied into eight form-builder files; `space-y-1` in two forms | F11, F12                  |
| `TextField`     | `type`: `text`, `email`, `number`, `password`, `search`; `size`: `md`, `lg` | every `Field` prop, `leadingIcon` (the search box gets a magnifier), controlled value or react-hook-form `register`                                                        | `Input` plus `Label` in eight places                                                                     | F1–F3, F19, F20, F23, F27 |
| `TextArea`      | `size`: `md`                                                                | `Field` props, `rows`, `autoGrow`                                                                                                                                          | `src/components/ui/textarea.tsx`                                                                         | F4                        |
| `SelectField`   | one look                                                                    | `Field` props, `options` (`{ label, value }[]`), `placeholder`                                                                                                             | Radix `Select` wired three times (`Select`, `State`, `Country`)                                          | F5–F8                     |
| `CheckboxField` | one look (`Field` with `layout: inline`)                                    | `Field` props, `checked`, `onCheckedChange`                                                                                                                                | `src/components/ui/checkbox.tsx` plus its label                                                          | F9                        |
| `Form`          | one look                                                                    | `schema` (Zod), `onSubmit`, `status` (`idle`, `submitting`, `success`, `error`), `successMessage`, `errorMessage`; two-column grid from `sm`, so `half` fields share a row | three ways to hold form state and errors: `FormBlock`, `LoginForm`, `ChangePasswordForm`                 | F13                       |

## Display

| Component    | Variants (`cva`)                                                                                      | Props                                                                                                                                       | Today                                                                                                      | Elements               |
| ------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| `Card`       | `variant`: `elevated`, `muted`, `tinted`, `outline`; `padding`: `sm`, `md`, `lg`                      | parts `CardMedia`, `CardBody`, `CardTitle` (`href` stretches the link over the card), `CardMeta`, `CardFooter`; `interactive` adds the lift | `src/components/ui/card.tsx` (unused) and fourteen hand-built card shells ([D3](evidence.md#duplication))  | C15, C17, C20, C21     |
| `CardGrid`   | `columns`: `2`, `3`, `4`; `gap`: `sm`, `md`                                                           | `as` (a list by default)                                                                                                                    | five grid class sets; `ContentBlock` uses `2` and `4`                                                      | C3, C4, C14            |
| `Badge`      | `variant`: `category`, `on-image`                                                                     | `children`                                                                                                                                  | `categoryPillClassName` string; uppercase labels in heroes                                                 | C12, H11               |
| `Media`      | `variant`: `cover`, `background`, `thumbnail`, `framed`, `video`; `aspect`: `video`, `square`, `auto` | `image` (`ImageRef`), `priority`, `sizes`, `fallback` (`brand`, `icon`, `none`), `caption` for `framed`                                     | `src/components/Media`, the media block, three different placeholders                                      | M1–M7                  |
| `DateTime`   | `format`: `short`, `long`                                                                             | `value` (ISO string); day-only values format in UTC, others in the site timezone                                                            | `formatDateShort` or `formatDateTime` plus a `<time>` built by hand in six places                          | C24, C25               |
| `MetaList`   | `variant`: `inline`, `stacked`, `on-image`                                                            | `items` (`{ icon?, label?, value }[]`)                                                                                                      | icon-and-text rows in event cards and the footer; label-and-value pairs in two heroes and the account page | N12, H9, H10, C22, C23 |
| `Heading`    | `variant`: `section`, `subsection`, `overline`                                                        | `as` (`h2`–`h6`)                                                                                                                            | heading classes written inline in twelve places                                                            | L7, H14–H16            |
| `Text`       | `variant`: `lead`, `muted`, `small`                                                                   | `as`, `clamp` (number of lines)                                                                                                             | paragraph classes written inline                                                                           | L8, C19, C26           |
| `PageHeader` | `variant`: `default`, `compact`                                                                       | `eyebrow`, `title`, `description`, `backLink`                                                                                               | nine copies with drift ([D5](evidence.md#duplication))                                                     | H12, H13               |
| `EmptyState` | `variant`: `boxed`, `plain`, `page`                                                                   | `title`, `description`, `action`                                                                                                            | six copies, five looks ([D6](evidence.md#duplication))                                                     | S1–S6                  |
| `Skeleton`   | one look                                                                                              | `className` for size only                                                                                                                   | `animate-pulse` box in the header                                                                          | S8                     |
| `DetailHero` | `variant`: `image`, `plain`                                                                           | `eyebrow` (a `Badge`), `title`, `facts` (`MetaList` items), `image`                                                                         | `PostHero` and `EventHero`, one a copy of the other; the post hero has no plain look                       | H6–H8                  |

## Feedback and overlays

| Component | Variants (`cva`)                              | Props                                                                                                     | Today                                                                            | Elements                    |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| `Alert`   | `tone`: `info`, `success`, `warning`, `error` | `title`, `children` (text or rich text); `role` follows the tone (`alert` for errors, `status` otherwise) | `src/components/ui/alert.tsx` (two tones) and the banner block's own four styles | F16, F17, F22, F25, F26, B5 |
| `Toast`   | `tone`: `info`                                | `message`, `action` (a `Button`), `onDismiss`                                                             | markup inside `VersionCheck`                                                     | S9                          |
| `Dialog`  | `variant`: `sheet`                            | `open`, `onOpenChange`, `title`; Radix gives focus trap, Escape, scroll lock and focus return             | the mobile menu's hand-written behaviour                                         | N10                         |

## Navigation

| Component     | Variants (`cva`)  | Props                                                                                                   | Today                                                            | Elements |
| ------------- | ----------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| `AdminBar`    | one look          | wraps Payload's admin bar (rule 6 allows that import in `platform/`); shown to staff only               | `src/components/AdminBar` (shown to residents too)               | L5       |
| `Breadcrumbs` | one look          | `items` (`{ label, href? }[]`); keeps the JSON-LD                                                       | `src/components/Breadcrumbs`                                     | N13      |
| `LoadMore`    | one look          | `status`, `shown`, `total`, `noun`, `onLoadMore`, `fallbackHref`; behaviour in a headless `useLoadMore` | `src/components/LoadMore`; its link becomes `Button · secondary` | N15      |
| `Accordion`   | `variant`: `card` | composed `AccordionItem`, `AccordionTrigger`, `AccordionContent` (Radix, or native `<details>`)         | FAQ markup in `faq/page.tsx`                                     | N16      |

## Layout

| Component      | Variants (`cva`)                                             | Props                   | Today                                                         | Elements |
| -------------- | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------- | -------- |
| `Container`    | `width`: `default`, `prose`, `narrow`                        | `as`                    | `.container` plus five reading-width caps and two form widths | L9–L11   |
| `Section`      | `tone`: `default`, `surface`, `brand`; `spacing`: `md`, `lg` | `as`, `aria-labelledby` | page wrappers and surface bands with six padding sets         | L12, L13 |
| `DetailLayout` | one look (`with-sidebar`)                                    | `aside`                 | the same grid in the post and event pages                     | L14      |

## Rich text (`src/platform/richtext/`)

| Component   | Variants (`cva`)                         | Props                              | Today                                                                          | Elements   |
| ----------- | ---------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ | ---------- |
| `RichText`  | `variant`: `prose`, `compact`, `inverse` | `data` (`RichTextValue`), `gutter` | `src/components/RichText` restyled with `[&_h2]`-style selectors in five files | B1–B4, F10 |
| `CodeBlock` | one look                                 | `code`, `language`                 | `src/blocks/Code`; copy button becomes `Button · secondary` with a Lucide icon | B6         |

## How many, and what to build first

- **32 shared components** (30 in `platform/ui/`, 2 in `platform/richtext/`). Thirteen grow out of
  code that exists: the seven shadcn primitives in `src/components/ui/` (`label` folds into
  `Field`), `AdminBar`, `Breadcrumbs`, `LoadMore`, `Media`, `RichText` and the code block. The
  other nineteen are new; each replaces markup copied between files.
- **One use today:** `Accordion` appears only on `/faq`. Under the rule "add a component when a
  second screen needs it" (#163), it could start in `directory/ui` and move up later. `Skeleton`,
  `Toast`, `Dialog` and `AdminBar` also have one element each, but it sits in the site layout, so
  every screen uses it.
- **Suggested order:** `Button` and `Link` (18 and 13 elements), then the form set (`Field`,
  `TextField`, `SelectField`, `Form`), then `Card`, `Media`, `PageHeader` and `EmptyState`.

## Choices for the owner

Two parts of the proposal differ from rules already written down. Each needs the owner's decision.

1. **Card looks against the card rules in [`ui-ux-design.md`](../guidelines/ui-ux-design.md#card-design)**
   (`bg-background`, never `bg-surface`; a border or a shadow, never both; `p-6` at least).
   - `elevated`: `bg-card`, `rounded-2xl`, `shadow-sm` and no border; `shadow-md` on hover when
     interactive. Follows "border or shadow"; uses `bg-card`, as every card does today, where the
     guideline says `bg-background`.
   - `outline`: `bg-background` with a border and no shadow (the form box). Follows the guideline.
   - `muted`: `bg-surface`, no border or shadow (account panels, the event location panel, boxed
     empty states). Breaks "never `bg-surface`": these are panels inside a page, not content cards.
     The alternative is to draw them as `outline`.
   - `tinted`: `bg-primary/10`, no border or shadow (the sidebar box). The guideline doesn't cover it.
   - `padding: sm` (`p-4`, for the compact event card and the stats cards) is below the `p-6` minimum.
2. **Plain props for blocks and heroes against
   [architecture rule 8](../architecture/README.md#dependency-rules).** Rule 8 says code that
   renders CMS content as authored (blocks, heroes) takes the generated Payload types. This proposal
   gives `PageHero`, `ContentBlock` and the other blocks plain typed props, mapped from the CMS by
   one function each, as the owner's plan on #163 (2026-10-20) asks: "Components receive plain
   typed data and never import Payload directly." If the owner agrees, rule 8 is updated in a
   follow-up change.
