# Data model

Everything is stored in one SQLite database (`DATABASE_URI`, default `file:./data/payload.db`); the schema is set up in `src/payload.config.ts` (collections, globals, plugins), each collection lives under `src/collections/`, and plugin overrides are in `src/plugins/index.ts`. Reflects `main` at `190cb3d` (Payload 3.91).

Every collection also has `id` (number), `createdAt` and `updatedAt`. Draft-enabled collections also have `_status` (`draft` | `published`). `slugField()` (Payload built-in) adds a hidden `generateSlug` checkbox (default true) and a `slug` text field (required, unique, indexed) generated from `title`.

## Collections

| Slug               | Purpose                                 | Drafts?                                | Read                          | Create/Update                                                      | Delete                      | Config file                                 |
| ------------------ | --------------------------------------- | -------------------------------------- | ----------------------------- | ------------------------------------------------------------------ | --------------------------- | ------------------------------------------- |
| `pages`            | Pages built from hero and blocks        | Yes (autosave, scheduled, 50 versions) | `authenticatedOrPublished`    | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/Pages/index.ts`            |
| `posts`            | News articles with rich text            | Yes (autosave, scheduled, 50 versions) | `authenticatedOrPublished`    | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/Posts/index.ts`            |
| `events`           | Neighborhood events with date and place | Yes (autosave, scheduled, 25 versions) | `authenticatedOrPublished`    | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/Events/index.ts`           |
| `faq`              | Questions and answers by category       | Yes (plain)                            | `authenticatedOrPublished`    | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/FAQ/index.ts`              |
| `resources`        | Local links and contacts by category    | Yes (plain)                            | `authenticatedOrPublished`    | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/Resources/index.ts`        |
| `team-members`     | Board members and AI agents             | No                                     | `anyone`                      | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/TeamMembers/index.ts`      |
| `categories`       | Nested categories for posts             | No                                     | `anyone`                      | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/Categories.ts`             |
| `media`            | Uploaded images and files               | No                                     | `anyone`                      | `isAdminOrEditor`                                                  | `isAdmin`                   | `src/collections/Media.ts`                  |
| `users`            | Login accounts with roles               | No                                     | `isAdminOrSelf`               | create `isAdmin`; update `isAdminOrSelf`                           | `isAdmin`                   | `src/collections/Users/index.ts`            |
| `forms`            | Form definitions built in admin         | No                                     | `anyone`                      | `isAdminOrEditor`                                                  | `isAdmin`                   | plugin form-builder, `src/plugins/index.ts` |
| `form-submissions` | Data visitors submit through forms      | No                                     | `isAdmin`                     | create `() => true` (inline); update `isAdmin`                     | `isAdmin`                   | plugin form-builder, `src/plugins/index.ts` |
| `redirects`        | Old URL to new URL mappings             | No                                     | `isAdmin`                     | `isAdmin`                                                          | `isAdmin`                   | plugin redirects, `src/plugins/index.ts`    |
| `search`           | Search index of posts and events        | No                                     | `() => true` (plugin default) | create `() => false` (plugin); update: Payload default (gap, #140) | Payload default (gap, #140) | plugin search, `src/plugins/index.ts`       |

What the access functions mean (`src/access/`):

- `anyone`: always true.
- `authenticatedOrPublished`: admin and editor see everything, including drafts; everyone else only sees `_status = published`.
- `isAdmin`: role `admin`. `isAdminOrEditor`: role `admin` or `editor`. A user with no role counts as `resident`.
- `isAdminOrSelf`: admin, or a user whose id equals the document id. Without an id (a list query) non-admins are denied.
- `users` also sets `access.admin: isAdminOrEditorBoolean` (who may open `/admin`: admin and editor).
- "Payload default" means no access function is set, so Payload uses `Boolean(req.user)`: any logged-in user, including `resident`.

Also present, not configured in this repo: `payload-folders` (from `media.folders: true`, Payload default access), `payload-jobs`, `payload-kv`, `payload-locked-documents`, `payload-preferences`, `payload-migrations`. `payload.config.ts` has no `jobs` config or runner, so scheduled publishing may never fire (#141).

## Fields by collection

### pages

| Field                  | Type           | Required    | Notes                                                                                                                                                                                                                                                            |
| ---------------------- | -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                | text           | Yes         | Admin title                                                                                                                                                                                                                                                      |
| `hero`                 | group          | `type` only | Tab Hero. `type` select: `none`, `highImpact`, `mediumImpact`, `lowImpact` (default `lowImpact`); `richText`; `links` (array, max 2, each a link group with `appearance` default or outline); `media` → media (required when type is highImpact or mediumImpact) |
| `layout`               | blocks         | Yes         | Tab Content. Allowed block types: `cta`, `content`, `mediaBlock`, `archive`, `formBlock`                                                                                                                                                                         |
| `meta`                 | group          | No          | meta (SEO plugin)                                                                                                                                                                                                                                                |
| `publishedAt`          | date           | No          | Sidebar. Set by hook `populatePublishedAt`                                                                                                                                                                                                                       |
| `generateSlug`, `slug` | checkbox, text | slug: Yes   | `slugField()`. Slug `home` is the site root                                                                                                                                                                                                                      |

### posts

| Field                  | Type                            | Required  | Notes                                                                                                                                   |
| ---------------------- | ------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                | text                            | Yes       |                                                                                                                                         |
| `heroImage`            | upload → media                  | No        |                                                                                                                                         |
| `content`              | richText                        | Yes       | Lexical: headings h1-h4, bold/italic/underline, links (to pages, posts, or URL), horizontal rule, blocks `banner`, `code`, `mediaBlock` |
| `relatedPosts`         | → posts (many)                  | No        | Sidebar. Filter excludes the post itself                                                                                                |
| `categories`           | → categories (many)             | No        | Sidebar                                                                                                                                 |
| `meta`                 | group                           | No        | meta (SEO plugin)                                                                                                                       |
| `publishedAt`          | date (day and time)             | No        | Sidebar. Field hook sets it to now if `_status` is published and it is empty                                                            |
| `authors`              | → users (many)                  | No        | Sidebar                                                                                                                                 |
| `populatedAuthors`     | array of `id` text, `name` text | No        | Hidden. Filled by afterRead hook `populateAuthors`; `update` access is `() => false`                                                    |
| `generateSlug`, `slug` | checkbox, text                  | slug: Yes | `slugField()`                                                                                                                           |

### events

| Field                                        | Type                | Required  | Notes                                                                                             |
| -------------------------------------------- | ------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `title`                                      | text                | Yes       |                                                                                                   |
| `date`                                       | date (day only)     | Yes       | Day-only picker (`pickerAppearance: 'dayOnly'`)                                                   |
| `timeStart`, `timeEnd`                       | text                | No        | Free text, e.g. "6:00 PM"                                                                         |
| `category`                                   | select              | No        | `meeting`, `social`, `volunteer`, `workshop`, `sports`, `community`, `other`; default `community` |
| `featured`                                   | checkbox            | No        | Default false                                                                                     |
| `locationType`                               | select              | No        | `in-person`, `virtual`, `hybrid`; default `in-person`                                             |
| `locationName`, `locationAddress`, `mapsUrl` | text                | No        | Hidden in admin when `locationType` is `virtual`                                                  |
| `registrationUrl`                            | text                | No        |                                                                                                   |
| `heroImage`                                  | upload → media      | No        |                                                                                                   |
| `description`                                | textarea            | No        | Short text for event cards                                                                        |
| `content`                                    | richText            | No        | Lexical: headings h2-h4, toolbars, horizontal rule                                                |
| `meta`                                       | group               | No        | meta (SEO plugin)                                                                                 |
| `publishedAt`                                | date (day and time) | No        | Sidebar. Set by hook `populatePublishedAt`                                                        |
| `generateSlug`, `slug`                       | checkbox, text      | slug: Yes | `slugField()`                                                                                     |

### categories

| Field                  | Type                                        | Required  | Notes                                                          |
| ---------------------- | ------------------------------------------- | --------- | -------------------------------------------------------------- |
| `title`                | text                                        | Yes       |                                                                |
| `generateSlug`, `slug` | checkbox, text                              | slug: Yes | `slugField()`. No drafts                                       |
| `parent`               | → categories (one)                          | No        | Added by nested-docs plugin                                    |
| `breadcrumbs`          | array of `doc` → categories, `url`, `label` | No        | Read-only; filled by nested-docs (URL = slugs joined with `/`) |

### media

| Field         | Type                                                                                                      | Required | Notes                                                                                                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alt`         | text                                                                                                      | Yes      |                                                                                                                                                                                                            |
| `caption`     | richText                                                                                                  | No       |                                                                                                                                                                                                            |
| `folder`      | → payload-folders (one)                                                                                   | No       | From `folders: true`                                                                                                                                                                                       |
| upload fields | `url`, `thumbnailURL`, `filename`, `mimeType`, `filesize`, `width`, `height`, `focalX`, `focalY`, `sizes` | Auto     | Files saved to `public/media`; `focalPoint` on; no `mimeTypes` limit. `sizes`: `thumbnail` 300w, `square` 500x500, `small` 600w, `medium` 900w, `large` 1400w, `xlarge` 1920w, `og` 1200x630 (crop center) |

### users

| Field       | Type                                                                                                                           | Required   | Notes                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | text                                                                                                                           | No         |                                                                                                                                  |
| `role`      | select                                                                                                                         | Yes        | `admin`, `editor`, `resident`; default `resident`; sidebar                                                                       |
| auth fields | `email`, `password`, `hash`, `salt`, `resetPasswordToken`, `resetPasswordExpiration`, `loginAttempts`, `lockUntil`, `sessions` | email: Yes | From `auth: true`. `timestamps: true`. No OAuth fields: `payload-oauth2` (named in CLAUDE.md) is not in `package.json` or `src/` |

### faq

| Field         | Type     | Required | Notes                                                                                  |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------------- |
| `question`    | text     | Yes      |                                                                                        |
| `answer`      | richText | Yes      | Site default Lexical editor (paragraph, bold, italic, underline, links to pages/posts) |
| `category`    | select   | No       | `general`, `membership`, `events`, `neighborhood`; default `general`                   |
| `order`       | number   | No       | Default 99; lower first; sidebar; also the default sort. No `slug` field               |
| `publishedAt` | date     | No       | Sidebar. Set by hook `populatePublishedAt`                                             |

### resources

| Field                  | Type           | Required | Notes                                                                                                    |
| ---------------------- | -------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `title`                | text           | Yes      |                                                                                                          |
| `description`, `phone` | textarea, text | No       |                                                                                                          |
| `url`                  | text           | No       | Validated: must start with `http://` or `https://`                                                       |
| `category`             | select         | Yes      | `elected-officials`, `public-safety`, `childcare`, `renting`, `parks`, `community`, `utilities`, `other` |
| `order`                | number         | No       | Default 99; lower first within category; sidebar; also the default sort. No `slug` field                 |
| `publishedAt`          | date           | No       | Sidebar. Set by hook `populatePublishedAt`                                                               |

### team-members

| Field                   | Type           | Required | Notes                                                       |
| ----------------------- | -------------- | -------- | ----------------------------------------------------------- |
| `memberType`            | select         | Yes      | `board-member`, `ai-agent`; default `board-member`; sidebar |
| `name`                  | text           | Yes      |                                                             |
| `role`                  | text           | Yes      | e.g. President                                              |
| `title`, `capabilities` | text, textarea | No       | Shown in admin only when `memberType` is `ai-agent`         |
| `bio`                   | textarea       | No       |                                                             |
| `email`                 | email          | No       |                                                             |
| `status`                | select         | Yes      | `active`, `inactive`; default `active`; sidebar             |
| `order`                 | number         | No       | Default 99; lower first; sidebar                            |
| `photo`                 | upload → media | No       |                                                             |

### Plugin-created collections

- `forms`: `title` (required), `fields` (blocks: `checkbox`, `country`, `email`, `message`, `number`, `select`, `state`, `text`, `textarea`; payment disabled), `submitButtonLabel`, `confirmationType` (`message` | `redirect`, default `message`), `confirmationMessage` (richText, required for message), `redirect.url`, `emails` (array: `emailTo`, `cc`, `bcc`, `replyTo`, `emailFrom`, `subject` required, `message` richText).
- `form-submissions`: `form` → forms (required), `submissionData` (array of `field` text, `value` textarea, both required).
- `redirects`: `from` (text, required, unique, indexed), `to` (group: `type` reference | custom, `reference` → pages | posts, `url`). Plugin covers `pages` and `posts`.
- `search`: `title`, `priority`, `doc` → posts | events (required), `slug`, `meta` (`title`, `description`, `image` → media), `categories` (array of `relationTo`, `categoryID`, `title`). Synced from `posts` and `events` only, drafts excluded.

## Globals

`header` and `footer` have the same shape and the same access: `read: () => true`; `update` is not set, so Payload default (any logged-in user). This is a gap, tracked in #140.

Field `navItems`: array, max 6 rows, optional. Each row is one `link` group: `type` (radio `reference` | `custom`, default `reference`), `newTab` (checkbox), `reference` → pages | posts (required when type is `reference`), `url` (text, required when type is `custom`), `label` (text, required). There is no `appearance` field.

## Relations

- `pages.hero.media` → media (one). `pages.hero.links[].link.reference` → pages | posts (one).
- `pages.layout`: `cta.links[].link.reference` → pages | posts; `content.columns[].link.reference` → pages | posts; `mediaBlock.media` → media (one); `archive.categories` → categories (many); `archive.selectedDocs` → posts (many); `formBlock.form` → forms (one).
- `posts.heroImage` → media (one); `posts.relatedPosts` → posts (many); `posts.categories` → categories (many); `posts.authors` → users (many).
- `posts.content` (Lexical): `mediaBlock` blocks → media; link nodes → pages | posts. The same link rule applies to `faq.answer`.
- `events.heroImage` → media (one); `team-members.photo` → media (one).
- `pages.meta.image`, `posts.meta.image`, `events.meta.image` → media (one). Generated types omit `meta.image` but the column exists (`meta_image_id`).
- `categories.parent` → categories (one); `categories.breadcrumbs[].doc` → categories; `media.folder` → payload-folders (one).
- `header.navItems[].link.reference`, `footer.navItems[].link.reference` → pages | posts (one).
- `redirects.to.reference` → pages | posts (one); `form-submissions.form` → forms (one, required); `search.doc` → posts | events (one, required); `search.meta.image` → media (one).
- `users`, `faq`, `resources`: no outgoing relations.

## Hooks that change data or caches

All revalidation hooks skip when `context.disableRevalidate` is set (seed scripts set it), except `revalidateRedirects`, which has no such guard.

| Collection                    | Hook                                                                                                       | When           | What it does                                                                                                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pages, events, faq, resources | `populatePublishedAt` (beforeChange)                                                                       | create, update | If the request body has no `publishedAt`, sets it to now. Reads `req.data`, not merged data. Posts do not use it: their `publishedAt` field has its own beforeChange hook that sets now when `_status` is `published` and the value is empty           |
| pages                         | `revalidatePage` (afterChange), `revalidateDelete` (afterDelete)                                           | save, delete   | If published (or deleted): `revalidatePath` of `/` (slug `home`) or `/<slug>`, plus `revalidateTag('pages-sitemap')`. If it was published and no longer is: same for the old slug                                                                      |
| posts                         | `revalidatePost` (afterChange), `revalidateDelete` (afterDelete)                                           | save, delete   | If published (or deleted): paths `/posts/<slug>`, `/posts`, `/(frontend)/posts/page/[pageNumber]`, `/`, tag `posts-sitemap`. If unpublished: same for the old slug                                                                                     |
| posts                         | `populateAuthors` (afterRead)                                                                              | every read     | Looks up each author in `users` (Local API, depth 0, access not enforced) and fills `populatedAuthors` with `id` and `name`                                                                                                                            |
| events                        | `revalidateEvent` (afterChange), `revalidateDelete` (afterDelete)                                          | save, delete   | If published (or deleted): paths `/events/<slug>`, `/events`, `/(frontend)/events/list/[scope]/[page]`, tags `events`, `events-sitemap`. If unpublished: same for the old slug                                                                         |
| faq, resources                | `revalidateFAQ` / `revalidateResource`, `revalidateDelete`                                                 | save, delete   | `revalidatePath('/faq')` + tag `faq`, or `revalidatePath('/resources')` + tag `resources`. No `_status` check, so drafts also trigger it                                                                                                               |
| header, footer                | `revalidateHeader`, `revalidateFooter` (afterChange)                                                       | save           | `revalidateTag('global_header')`, `revalidateTag('global_footer')`                                                                                                                                                                                     |
| posts, events                 | search plugin sync (afterChange), `deleteFromSearch` (beforeDelete)                                        | save, delete   | Creates, updates or deletes the matching `search` doc. Drafts are not synced; a search doc is deleted when the doc is a draft with no published version. `beforeSync` copies `slug`, `meta` (title falls back to `title`) and category titles          |
| categories                    | nested-docs: `populateBreadcrumbs` (beforeChange); `resaveChildren`, `resaveSelfAfterCreate` (afterChange) | save           | Builds `breadcrumbs` from the parent chain; re-saves child categories and, after create, the new category itself                                                                                                                                       |
| redirects                     | `revalidateRedirects` (afterChange)                                                                        | save           | `revalidateTag('redirects')`                                                                                                                                                                                                                           |
| form-submissions              | `limitSubmissionSize` (beforeValidate)                                                                     | create         | Rejects with 413 or 400 if more than 50 rows, a field name over 100 characters, a value over 10,000, a total over 20,000, or a row that is not text/number/boolean                                                                                     |
| form-submissions              | `rateLimitSubmissions`, `verifyHumanSubmission` (beforeChange)                                             | create         | Max 5 submissions per IP per hour (in memory), then 429. Then a Cloudflare Turnstile token check (only active when Turnstile keys are set; failure gives 400). Admins and editors skip both                                                            |
| form-submissions              | `dropEmailsToSubmittedAddresses` (plugin `beforeEmail`, runs in the plugin's afterChange email send)       | create         | Drops emails whose to/cc/bcc contains `{{...}}` from the form values; blanks a From built from form values; keeps a form-based Reply-To only if it is a single address; caps form emails at 30 per hour site-wide. The submission is stored either way |

## Field-level access

- `users.role`: create and update `isAdminFieldAccess` (admin only); read `() => true`.
- `forms.emails`: read `isAdminOrEditorFieldAccess` (overrides the plugin default so recipients and templates stay private even though `forms` is publicly readable).
- `posts.populatedAuthors`: update `() => false`.
- No other field sets its own access. In particular `team-members.email` is exposed through the public read of `team-members` (#140).

## Source

Written from the collection, global and plugin configs on `main` at `190cb3d`, `src/payload-types.ts`, and the Payload 3.91.0 package defaults. Update this page in the same PR as any schema or access change.
