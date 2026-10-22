# Component set: area components and coverage

Part of the [UI inventory](inventory.md) (#170). The shared components are in
[component-set.md](component-set.md).

> **Status: approved** by the owner on 2026-10-21, with the merges in
> [component-set.md](component-set.md#how-many-and-what-to-build-first).

## Area components

Each lives in its module's `ui/` and is built from the shared components. Modules never import each
other: where two meet (the header shows the account links; the post page shows upcoming events), the
page or layout in `src/app/` composes them ([0008](../architecture/decisions/0008-compose-modules-at-the-app-level.md)).

| Module      | Component           | Variants (`cva`)                                | Props (plain data)                                                    | Built from                                                                                                | Today                                                                             | Elements   |
| ----------- | ------------------- | ----------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| `site`      | `SiteHeader`        | one look                                        | `navItems` (resolved links), `account` slot, `current` path           | `Section · page`, `Link · nav`, `Button`, `Dialog · sheet`; a pulsing placeholder while the account loads | `src/Header/` (desktop and mobile markup written twice)                           | L2, S8     |
| `site`      | `SiteFooter`        | one look                                        | `navItems`; hides a column with no links                              | `Section · page`, `Text · overline`, `Link · muted`, `MetaList`                                           | `src/Footer/Component.tsx`                                                        | L6         |
| `site`      | `Logo`              | `size`: `md`, `lg`                              | —                                                                     | —                                                                                                         | `src/components/Logo/Logo.tsx`                                                    | L3, L4     |
| `site`      | `PageHero`          | `variant`: `high`, `medium`, `low`              | `title` and `body` (`RichTextValue`), `image`, `links`                | `Media`, `RichText`, `Button`                                                                             | `src/heros/` (three components and `RenderHero`)                                  | H1, H4, H5 |
| `site`      | `ContentBlock`      | `layout`: `single`, `columns`, `cards`, `stats` | `columns` (`{ size, body, link? }[]`)                                 | `Section`, `CardGrid`, `Card`, `RichText · compact`, `Button`                                             | `src/blocks/Content/Component.tsx` (layout guessed from sizes)                    | B8–B11     |
| `site`      | `CallToActionBlock` | one look                                        | `body`, `links`                                                       | `Section · brand`, `RichText · inverse`, `Button · inverse`                                               | `src/blocks/CallToAction/Component.tsx`                                           | B13        |
| `site`      | `ArchiveBlock`      | one look                                        | `intro`, `posts` (loaded by a use case, not inside the component)     | `Section · surface`, `CardGrid`, the `news` card passed in by `app/`                                      | `src/blocks/ArchiveBlock/Component.tsx` (posts from `findArchivePosts` in `news`) | B16        |
| `news`      | `PostCard`          | `variant`: `default`, `compact`                 | `post` (`PostSummary`: title, href, date, categories, summary, image) | `Card · elevated`, `Media`, `Badge`, `DateTime`                                                           | `PostCard` and `SidebarPosts` in `src/modules/news/ui/`                           | C1, C2, C8 |
| `events`    | `EventCard`         | `variant`: `featured`, `compact`, `inline`      | `event` (`EventSummary`)                                              | `Card · elevated`, `Media`, `DateBadge`, `MetaList`, `Badge`                                              | `EventCard` and `SidebarEvents` in `src/modules/events/ui/`                       | C5–C7      |
| `events`    | `DateBadge`         | `variant`: `floating`, `plain`, `tinted`        | `date`                                                                | —                                                                                                         | `DateBadge` in `EventCard` and a second copy in `SidebarEvents`                   | C9–C11     |
| `directory` | `ResourceCard`      | one look                                        | `resource` (`ResourceSummary`)                                        | `Card · elevated`, `Link · action`                                                                        | `src/modules/directory/ui/ResourceCard.tsx`                                       | C13        |
| `directory` | `FaqList`           | one look                                        | `items` (`{ question, answer }[]`, answers as `RichTextValue`)        | `Card · outline`, `RichText · compact`, native `<details>`                                                | `src/modules/directory/ui/FaqList.tsx`                                            | N16        |
| `contact`   | `FormBlock`         | one look                                        | `form` (each field mapped to a `Field` control), `intro`              | `Form`, `Field`, `Card · outline`, `Alert`                                                                | `src/blocks/Form/` (nine field files)                                             | B17        |
| `contact`   | `TurnstileWidget`   | one look                                        | `onToken`, `onLoadError`, `onWidgetError`, `resetSignal`              | —                                                                                                         | `src/components/TurnstileWidget`                                                  | F18        |

Compositions with no element of their own: `PostsFeed` and `EventsFeed` (a `CardGrid` of cards plus
`LoadMore`), the search form in `news` (`Field · search` plus the URL), `AccountMenu` in
`accounts` (`Link · nav` and `Button · ghost`), `LoginForm` and `ChangePasswordForm` (`Form`), and
`VersionCheck` (`Toast`). Variants with no element of their own (`Card · elevated`,
`Card · outline`, `CardGrid` columns `2` and `4`, `Section · brand`, `Button` size `sm`) are used inside the area components.

## Not needed yet

The set holds only what an element needs. The epic's first guess listed about 20 components; the
inventory keeps most, and finds no element for these components and variants:

| Component or variant             | Why not now                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `RadioGroup`                     | no public form has radio buttons; Payload's `radio` fields stay in the admin      |
| `Switch`                         | no on/off control on the site (the theme selector exists in code but isn't shown) |
| `Tabs`                           | no tabbed content                                                                 |
| `Table`                          | no tables, in content or in screens                                               |
| `Pagination`                     | lists use "Load more" with a no-JavaScript fallback page; `LoadMore` covers it    |
| `Field.Input` types `tel`, `url` | no public form asks for a phone number or a web address                           |
| `Text · body`                    | body copy comes through `RichText`; no element uses a plain body paragraph        |
| `Alert` sizes                    | every alert today is the same size                                                |
| `Dialog · center`                | the only dialog is the mobile menu, a sheet                                       |

Added by the inventory, with no counterpart in the epic: `CardGrid`, `DateTime`, `MetaList`,
`Text`, `PageHeader`, `EmptyState`, `Section`, `DetailLayout`, and variants on `RichText`.
Each one replaces markup copied between files ([evidence](evidence.md#duplication)). `Accordion`
from the epic's list is `FaqList` until a second screen needs one.

## Coverage

Every element in the inventory maps to exactly one component and variant: 138 elements,
91 component-variant pairs, 37 components (23 shared, 14 area). `{style}` and
`{appearance}` mean the CMS field picks the variant. The table below is generated from the
element tables by script, so no element is missing and none maps twice.

| Component · variant         | Elements                                          | Count |
| --------------------------- | ------------------------------------------------- | ----: |
| Button · accent             | H3                                                |     1 |
| Button · ghost              | S11, N7, N9                                       |     3 |
| Button · inverse            | B14                                               |     1 |
| Button · inverse-outline    | B15                                               |     1 |
| Button · primary            | C16, C18, F14, F15, F21, F24, S7, S10, L1, N8, H2 |    11 |
| Button · secondary          | B7                                                |     1 |
| Button · {appearance}       | B12                                               |     1 |
| Link · action               | N14, N17, N18, N19                                |     4 |
| Link · inline               | N20                                               |     1 |
| Link · muted                | N11                                               |     1 |
| Link · nav                  | N1, N2, N3, N4, N5, N6                            |     6 |
| Field · checkbox            | F9                                                |     1 |
| Field · email               | F2, F19                                           |     2 |
| Field · number              | F3                                                |     1 |
| Field · password            | F20, F23                                          |     2 |
| Field · search              | F27                                               |     1 |
| Field · select              | F5, F6, F7, F8                                    |     4 |
| Field · stacked             | F11, F12                                          |     2 |
| Field · text                | F1                                                |     1 |
| Field · textarea            | F4                                                |     1 |
| Form · default              | F13                                               |     1 |
| Card · muted                | C17, C20, C21                                     |     3 |
| Card · tinted               | C15                                               |     1 |
| CardGrid · 3                | C3, C4, C14                                       |     3 |
| Badge · category            | C12                                               |     1 |
| Badge · on-image            | H11                                               |     1 |
| Media · background          | M4                                                |     1 |
| Media · cover               | M1, M2                                            |     2 |
| Media · framed              | M5, M6                                            |     2 |
| Media · thumbnail           | M3                                                |     1 |
| Media · video               | M7                                                |     1 |
| DateTime · long             | C25                                               |     1 |
| DateTime · short            | C24                                               |     1 |
| MetaList · inline           | C23, N12, H10                                     |     3 |
| MetaList · on-image         | H9                                                |     1 |
| MetaList · stacked          | C22                                               |     1 |
| Text · lead                 | C19                                               |     1 |
| Text · muted                | C26                                               |     1 |
| Text · overline             | L7, H15                                           |     2 |
| Text · section              | H14                                               |     1 |
| Text · small                | L8                                                |     1 |
| Text · subsection           | H16                                               |     1 |
| PageHeader · compact        | H13                                               |     1 |
| PageHeader · default        | H8, H12                                           |     2 |
| PageHeader · image          | H6, H7                                            |     2 |
| EmptyState · boxed          | S1, S2, S4                                        |     3 |
| EmptyState · page           | S6                                                |     1 |
| EmptyState · plain          | S3, S5                                            |     2 |
| Alert · error               | F16, F22, F25                                     |     3 |
| Alert · success             | F17, F26                                          |     2 |
| Alert · {style}             | B5                                                |     1 |
| Toast · info                | S9                                                |     1 |
| Dialog · sheet              | N10                                               |     1 |
| AdminBar · default          | L5                                                |     1 |
| Breadcrumbs · default       | N13                                               |     1 |
| LoadMore · default          | N15                                               |     1 |
| Section · narrow            | L11                                               |     1 |
| Section · page              | L9                                                |     1 |
| Section · plain             | L12                                               |     1 |
| Section · prose             | L10                                               |     1 |
| Section · surface           | L13                                               |     1 |
| DetailLayout · with-sidebar | L14                                               |     1 |
| RichText · compact          | B4, F10                                           |     2 |
| RichText · inverse          | B3                                                |     1 |
| RichText · prose            | B1, B2                                            |     2 |
| CodeBlock · default         | B6                                                |     1 |
| SiteHeader · default        | S8, L2                                            |     2 |
| SiteFooter · default        | L6                                                |     1 |
| Logo · lg                   | L4                                                |     1 |
| Logo · md                   | L3                                                |     1 |
| PageHero · high             | H1                                                |     1 |
| PageHero · low              | H5                                                |     1 |
| PageHero · medium           | H4                                                |     1 |
| ContentBlock · cards        | B9                                                |     1 |
| ContentBlock · columns      | B11                                               |     1 |
| ContentBlock · single       | B8                                                |     1 |
| ContentBlock · stats        | B10                                               |     1 |
| CallToActionBlock · default | B13                                               |     1 |
| ArchiveBlock · default      | B16                                               |     1 |
| PostCard · compact          | C8                                                |     1 |
| PostCard · default          | C1, C2                                            |     2 |
| EventCard · compact         | C6                                                |     1 |
| EventCard · featured        | C5                                                |     1 |
| EventCard · inline          | C7                                                |     1 |
| DateBadge · floating        | C9                                                |     1 |
| DateBadge · plain           | C10                                               |     1 |
| DateBadge · tinted          | C11                                               |     1 |
| ResourceCard · default      | C13                                               |     1 |
| FaqList · default           | N16                                               |     1 |
| FormBlock · default         | B17                                               |     1 |
| TurnstileWidget · default   | F18                                               |     1 |
