# Proposed component set: area components and coverage

Part of the [UI inventory](inventory.md) (#170). The shared components are in
[component-set.md](component-set.md).

> **Status: proposal.** The owner reviews and approves the set before any component is built.

## Area components

Each lives in its module's `ui/` and is built from the shared components. Modules never import each
other: where two meet (the header shows the account links; the post page shows upcoming events), the
page or layout in `src/app/` composes them ([0008](../architecture/decisions/0008-compose-modules-at-the-app-level.md)).

| Module      | Component           | Variants (`cva`)                                | Props (plain data)                                                    | Built from                                                           | Today                                                            | Elements   |
| ----------- | ------------------- | ----------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| `site`      | `SiteHeader`        | one look                                        | `navItems` (resolved links), `account` slot, `current` path           | `Container`, `Link · nav`, `Button`, `Dialog · sheet`                | `src/Header/` (desktop and mobile markup written twice)          | L2         |
| `site`      | `SiteFooter`        | one look                                        | `navItems`; hides a column with no links                              | `Container`, `Heading · overline`, `Link · muted`, `MetaList`        | `src/Footer/Component.tsx`                                       | L6         |
| `site`      | `Logo`              | `size`: `md`, `lg`                              | —                                                                     | —                                                                    | `src/components/Logo/Logo.tsx`                                   | L3, L4     |
| `site`      | `PageHero`          | `variant`: `high`, `medium`, `low`              | `title` and `body` (`RichTextValue`), `image`, `links`                | `Media`, `RichText`, `Button`                                        | `src/heros/` (three components and `RenderHero`)                 | H1, H4, H5 |
| `site`      | `ContentBlock`      | `layout`: `single`, `columns`, `cards`, `stats` | `columns` (`{ size, body, link? }[]`)                                 | `Section`, `Card`, `RichText · compact`, `Button`                    | `src/blocks/Content/Component.tsx` (layout guessed from sizes)   | B8–B11     |
| `site`      | `CallToActionBlock` | one look                                        | `body`, `links`                                                       | `Section · brand`, `RichText · inverse`, `Button · inverse`          | `src/blocks/CallToAction/Component.tsx`                          | B13        |
| `site`      | `ArchiveBlock`      | one look                                        | `intro`, `posts` (loaded by a use case, not inside the component)     | `Section · surface`, `CardGrid`, the `news` card passed in by `app/` | `src/blocks/ArchiveBlock/Component.tsx` (queries Payload itself) | B16        |
| `news`      | `PostCard`          | `variant`: `default`, `compact`                 | `post` (`PostSummary`: title, href, date, categories, summary, image) | `Card · elevated`, `Media`, `Badge`, `DateTime`                      | `src/components/Card`, `src/components/SidebarPosts`             | C1, C2, C8 |
| `events`    | `EventCard`         | `variant`: `featured`, `compact`, `inline`      | `event` (`EventSummary`)                                              | `Card · elevated`, `Media`, `DateBadge`, `MetaList`, `Badge`         | `src/components/EventCard`, `src/components/SidebarEvents`       | C5–C7      |
| `events`    | `DateBadge`         | `variant`: `floating`, `plain`, `tinted`        | `date`                                                                | —                                                                    | `DateBadge` in `EventCard` and a second copy in `SidebarEvents`  | C9–C11     |
| `directory` | `ResourceCard`      | one look                                        | `resource` (`ResourceSummary`)                                        | `Card · elevated`, `Link · action`                                   | markup in `resources/page.tsx`                                   | C13        |
| `contact`   | `FormBlock`         | one look                                        | `form` (fields mapped to field components), `intro`                   | `Form`, the field components, `Card · outline`, `Alert`              | `src/blocks/Form/` (nine field files)                            | B17        |
| `contact`   | `TurnstileWidget`   | one look                                        | `onToken`, `onLoadError`, `onWidgetError`, `resetSignal`              | —                                                                    | `src/components/TurnstileWidget`                                 | F18        |
| `platform`  | `AdminBar`          | one look                                        | wraps Payload's admin bar; shown to staff only                        | —                                                                    | `src/components/AdminBar` (shown to residents too)               | L5         |

Compositions with no element of their own: `PostsFeed` and `EventsFeed` (a `CardGrid` of cards plus
`LoadMore`), the search form in `news` (`TextField · search` plus the URL), `AccountMenu` in
`accounts` (`Link · nav` and `Button · ghost`), `LoginForm` and `ChangePasswordForm` (`Form`), and
`VersionCheck` (`Toast`). Variants with no element of their own (`Card · elevated`,
`Card · outline`, `Section · brand`, `Button` size `sm`) are used inside the area components.

## Not needed yet

The epic's first guess listed about 20 components. The inventory keeps most, and finds no element for
these:

| From the epic | Why not now                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| `RadioGroup`  | no public form has radio buttons; Payload's `radio` fields stay in the admin      |
| `Switch`      | no on/off control on the site (the theme selector exists in code but isn't shown) |
| `Tabs`        | no tabbed content                                                                 |
| `Table`       | no tables, in content or in screens                                               |
| `Pagination`  | lists use "Load more" with a no-JavaScript fallback page; `LoadMore` covers it    |

Added by the inventory, with no counterpart in the epic: `CardGrid`, `DateTime`, `MetaList`,
`Heading`, `Text`, `PageHeader`, `EmptyState`, `Skeleton`, `DetailHero`, `Container`, `Section`,
`DetailLayout`, and variants on `RichText`. Each one replaces markup copied between files
([evidence](evidence.md#duplication)).

## Coverage

Every element in the inventory maps to exactly one component and variant: 138 elements, 94
component-variant pairs, 45 components (31 shared, 14 area). `{style}` and `{appearance}` mean the
CMS field picks the variant. The table below was checked against the element tables and the
component tables by script: no element is missing, none maps twice, and every component row lists
exactly the elements that point to it.

| Component · variant         | Elements                                      | Count |
| --------------------------- | --------------------------------------------- | ----: |
| Button · primary            | N8, H2, C16, C18, F14, F15, F21, F24, S7, S10 |    10 |
| Button · secondary          | B7                                            |     1 |
| Button · accent             | H3                                            |     1 |
| Button · ghost              | N3, N7, N9, S11                               |     4 |
| Button · inverse            | B14                                           |     1 |
| Button · inverse-outline    | B15                                           |     1 |
| Button · {appearance}       | B12                                           |     1 |
| Link · nav                  | N1, N2, N4, N5, N6                            |     5 |
| Link · muted                | N11                                           |     1 |
| Link · action               | N14, N17, N18, N19                            |     4 |
| Link · inline               | N20                                           |     1 |
| Link · skip                 | L1                                            |     1 |
| Field · stacked             | F11, F12                                      |     2 |
| TextField · text            | F1                                            |     1 |
| TextField · email           | F2, F19                                       |     2 |
| TextField · number          | F3                                            |     1 |
| TextField · password        | F20, F23                                      |     2 |
| TextField · search          | F27                                           |     1 |
| TextArea · default          | F4                                            |     1 |
| SelectField · default       | F5, F6, F7, F8                                |     4 |
| CheckboxField · default     | F9                                            |     1 |
| Form · default              | F13                                           |     1 |
| Card · tinted               | C15                                           |     1 |
| Card · muted                | C17, C20, C21                                 |     3 |
| CardGrid · 3                | C3, C4, C14                                   |     3 |
| Badge · category            | C12                                           |     1 |
| Badge · on-image            | H11                                           |     1 |
| Media · cover               | M1, M2                                        |     2 |
| Media · thumbnail           | M3                                            |     1 |
| Media · background          | M4                                            |     1 |
| Media · framed              | M5, M6                                        |     2 |
| Media · video               | M7                                            |     1 |
| DateTime · short            | C24                                           |     1 |
| DateTime · long             | C25                                           |     1 |
| MetaList · inline           | N12, H10, C23                                 |     3 |
| MetaList · stacked          | C22                                           |     1 |
| MetaList · on-image         | H9                                            |     1 |
| Heading · section           | H14                                           |     1 |
| Heading · subsection        | H16                                           |     1 |
| Heading · overline          | L7, H15                                       |     2 |
| Text · lead                 | C19                                           |     1 |
| Text · muted                | C26                                           |     1 |
| Text · small                | L8                                            |     1 |
| PageHeader · default        | H12                                           |     1 |
| PageHeader · compact        | H13                                           |     1 |
| EmptyState · boxed          | S1, S2, S4                                    |     3 |
| EmptyState · plain          | S3, S5                                        |     2 |
| EmptyState · page           | S6                                            |     1 |
| Skeleton · default          | S8                                            |     1 |
| DetailHero · image          | H6, H7                                        |     2 |
| DetailHero · plain          | H8                                            |     1 |
| Alert · error               | F16, F22, F25                                 |     3 |
| Alert · success             | F17, F26                                      |     2 |
| Alert · {style}             | B5                                            |     1 |
| Toast · info                | S9                                            |     1 |
| Dialog · sheet              | N10                                           |     1 |
| Breadcrumbs · default       | N13                                           |     1 |
| LoadMore · default          | N15                                           |     1 |
| Accordion · card            | N16                                           |     1 |
| Container · default         | L9                                            |     1 |
| Container · prose           | L10                                           |     1 |
| Container · narrow          | L11                                           |     1 |
| Section · default           | L12                                           |     1 |
| Section · surface           | L13                                           |     1 |
| DetailLayout · with-sidebar | L14                                           |     1 |
| RichText · prose            | B1, B2                                        |     2 |
| RichText · compact          | B4, F10                                       |     2 |
| RichText · inverse          | B3                                            |     1 |
| CodeBlock · default         | B6                                            |     1 |
| SiteHeader · default        | L2                                            |     1 |
| SiteFooter · default        | L6                                            |     1 |
| Logo · md                   | L3                                            |     1 |
| Logo · lg                   | L4                                            |     1 |
| PageHero · high             | H1                                            |     1 |
| PageHero · medium           | H4                                            |     1 |
| PageHero · low              | H5                                            |     1 |
| ContentBlock · single       | B8                                            |     1 |
| ContentBlock · columns      | B11                                           |     1 |
| ContentBlock · cards        | B9                                            |     1 |
| ContentBlock · stats        | B10                                           |     1 |
| CallToActionBlock · default | B13                                           |     1 |
| ArchiveBlock · default      | B16                                           |     1 |
| PostCard · default          | C1, C2                                        |     2 |
| PostCard · compact          | C8                                            |     1 |
| EventCard · featured        | C5                                            |     1 |
| EventCard · compact         | C6                                            |     1 |
| EventCard · inline          | C7                                            |     1 |
| DateBadge · floating        | C9                                            |     1 |
| DateBadge · plain           | C10                                           |     1 |
| DateBadge · tinted          | C11                                           |     1 |
| ResourceCard · default      | C13                                           |     1 |
| FormBlock · default         | B17                                           |     1 |
| TurnstileWidget · default   | F18                                           |     1 |
| AdminBar · default          | L5                                            |     1 |
