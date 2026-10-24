# Glossary

Business terms, defined once. Code, docs, issues and the site's own wording use these meanings.
When a term's rule lives in code, the right column says where it lives today (and, after #127,
which module owns it).

## People and roles

| Term                | Meaning                                                                                                                                                                                              | Where the rule lives                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Visitor             | Anyone on the site who isn't signed in.                                                                                                                                                              | n/a                                                                                       |
| Resident            | A signed-in account with the `resident` role: reads published content, edits only their own profile. The default role.                                                                               | `ROLES` in `src/platform/lib/roles.ts`; checks in `src/platform/payload/roles.ts`         |
| Editor              | A signed-in account with the `editor` role: creates and edits content, opens `/admin`.                                                                                                               | same                                                                                      |
| Admin               | A signed-in account with the `admin` role: everything, including users, roles and deletes.                                                                                                           | same                                                                                      |
| Staff               | Admins and editors together (`hasAdminOrEditor`). Staff skip the form rate limit and robot check.                                                                                                    | same                                                                                      |
| Account             | A login in `users`: an email, a password, an optional name and one role.                                                                                                                             | `src/modules/accounts/cms/users.ts`                                                       |
| Current user        | Who is signed in for a request, from Payload's auth cookie; `null` for a visitor.                                                                                                                    | `getCurrentUser` in `src/modules/accounts/`                                               |
| Signing in          | Email and password, checked by Payload. Every refusal (wrong password, unknown email, locked account) reads the same.                                                                                | `signIn` in `src/modules/accounts/actions.ts`                                             |
| Changing a password | On `/account` only, after Payload checks the current one. The users collection refuses your own new password sent any other way (REST, GraphQL, `/admin`); an admin can still set another account's. | `changePassword` in `src/modules/accounts/actions.ts`; `requireCurrentPassword` in `cms/` |
| Owner               | The repo owner. Decides policy and `needs owner` items, and can merge or revert anything (`AGENTS.md`).                                                                                              | n/a                                                                                       |

## Content states

| Term      | Meaning                                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft     | Saved but not visible to visitors. Only staff should see drafts: normal reads use `authenticatedOrPublished`, but until #140 is fixed any signed-in user can read drafts through the versions API. |
| Published | Visible to everyone. Stored as `_status: 'published'`.                                                                                                                                             |
| Scheduled | Set in Admin to publish at a later time. Needs a job runner to actually publish (#141).                                                                                                            |

## Events

| Term             | Meaning                                                                                                                       | Where the rule lives                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Event date       | A calendar day with no time (Payload "day only"), stored as midnight UTC, for example `2026-03-03T00:00:00.000Z` for March 3. | `src/modules/events/cms/events.ts`                                                                                  |
| Event time       | Free text in site time, for example "6:00 PM". Not used for sorting.                                                          | same                                                                                                                |
| Upcoming event   | A published event whose date is today or later, where "today" is the date in the site timezone.                               | `inScope` in `src/modules/events/data/scope.ts`, with today from `startOfToday()` in `src/platform/lib/timezone.ts` |
| Past event       | A published event whose date is before today in the site timezone.                                                            | same                                                                                                                |
| Event category   | One of: Meeting, Social, Volunteer, Workshop, Sports & Recreation, Community, Other. Phase 2 will revise the list (#122).     | `EVENT_CATEGORIES` in `src/modules/events/domain/categories.ts`, also the collection's options                      |
| Cancelled event  | Planned (#122): still listed, clearly marked as cancelled, never silently removed.                                            | not built yet                                                                                                       |
| Official meeting | Planned (#122): a city or county meeting, shown with a link to the official agenda.                                           | not built yet                                                                                                       |

## News

| Term              | Meaning                                                                                                                                                                        | Where the rule lives                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Post              | A news article (`posts`). Shown newest first by its published date.                                                                                                            | `src/modules/news/cms/posts.ts`; the order in `data/queries.ts`                                                               |
| Post category     | A nested category (`categories`) a post can belong to.                                                                                                                         | `src/modules/news/cms/categories.ts`                                                                                          |
| Byline            | A post's author names: "Ana", "Ana and Ben", "Ana, Ben and Cy". Authors without a name are left out.                                                                           | `formatAuthors` in `src/modules/news/domain/authors.ts`                                                                       |
| Related posts     | Posts an editor links to a post, listed beside it. Only those the reader may see are shown.                                                                                    | `toPostDetail` in `src/modules/news/data/mappers.ts`                                                                          |
| You May Also Like | The 3 newest published posts beside a post, other than the post itself and its related posts.                                                                                  | `recentPostExclusions` in `src/modules/news/domain/related.ts`, applied by `latestPostsWhere` in `data/filters.ts`            |
| Archive block     | A page-builder block listing posts (the home page's "Recent News"): the newest, optionally by category, or picked.                                                             | `findArchivePosts` in `src/modules/news/use-cases/findArchivePosts.ts`; the filter is `latestPostsWhere` in `data/filters.ts` |
| Search query      | What a visitor searches for (`/search?q=`): the first `q`, trimmed; only spaces is no query. It matches posts and events by title, slug or search-engine title or description. | `parseSearchQuery` in `src/modules/news/domain/search.ts`; the match is `searchMatch` in `data/filters.ts`                    |

## Reference content

| Term        | Meaning                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------- |
| Resource    | An entry in the local directory: a link and contact for a service, by category (`resources`). |
| FAQ entry   | A question and answer, by category (`faq`).                                                   |
| Team member | A board member or an AI agent listed on the site (`team-members`).                            |

## Site

| Term               | Meaning                                                                                                                  | Where the rule lives                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Page               | A CMS page (`pages`) built from a hero and page-builder blocks, at `/<slug>`; the page `home` is the front page, at `/`. | `src/modules/site/cms/pages.ts`; the address in `documentHref` (`src/platform/payload/documentHref.ts`)                  |
| Page-builder block | One section of a page's layout: call to action, content, media, archive (news) or form (contact).                        | the site's own in `SITE_LAYOUT_BLOCKS`; the components in the block registry, `src/app/(frontend)/[slug]/pageBlocks.tsx` |
| Nav item           | A link in the header or footer (`header`, `footer` globals), up to six each.                                             | `src/modules/site/cms/navGlobal.ts`                                                                                      |
| Current page link  | The header link for the page a visitor is on, or for the section that page is in.                                        | `isActivePath` in `src/modules/site/domain/nav.ts`                                                                       |
| Redirect           | An old address that sends visitors to a URL, page or post. A redirect to a draft goes nowhere.                           | `getRedirectTarget` in `src/modules/site/use-cases/getRedirectTarget.ts`                                                 |

## Forms and email

| Term                 | Meaning                                                                                                                                                                                                                                    | Where the rule lives                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Form                 | A form built in Admin (`forms`), for example the contact form. Its email settings are visible to staff only.                                                                                                                               | `src/modules/contact/cms/formBuilder.ts`                                                                                  |
| Submission           | What a visitor sends through a form (`form-submissions`). Always stored, even when no email goes out, and never deleted for a missed confirmation click.                                                                                   | same                                                                                                                      |
| Owner notification   | An email from a submission to an address configured in Admin (for example the association inbox), with Reply-To set to the visitor. Sent once the sender confirms their email (held until then, #287), with a line saying it is confirmed. | `toSafeFormEmail` in `src/modules/contact/domain/formEmails.ts`                                                           |
| Visitor confirmation | A form-builder email to the address a visitor typed. Blocked on purpose: otherwise anyone could make the site email any address. The confirmation link is sent by the site itself, with its own limits.                                    | same                                                                                                                      |
| Email confirmation   | Proving an address belongs to the person who typed it: the site emails a link, and clicking it confirms the address (#183). Kept apart from accounts.                                                                                      | `src/modules/verification/` (collection `email-confirmations`)                                                            |
| Confirmation link    | The only email the site sends to a typed address before it is confirmed: fixed text, works for 24 hours. At most 5 per hour per connection, 3 per day per address and 30 per hour site-wide.                                               | `CONFIRMATION_LIMITS` in `src/modules/verification/domain/limits.ts`                                                      |
| Robot check          | Cloudflare Turnstile: an invisible check that a submission comes from a person. When on, any error rejects; staff skip it; off when its keys are unset.                                                                                    | `HumanVerifier` in `src/platform/lib/humanCheck.ts`; `TurnstileVerifier` in `src/platform/turnstile/turnstileVerifier.ts` |
| Rate limit           | At most 5 submissions per hour from one connection (skipped when no client IP is known), and at most 30 form emails per hour site-wide.                                                                                                    | `RATE_LIMITS` in `src/modules/contact/domain/rateLimits.ts`, applied in `src/modules/contact/cms/rateLimits.ts`           |

## Time

| Term          | Meaning                                                                                                | Where the rule lives           |
| ------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Site timezone | `SITE_TIMEZONE`, default `America/Chicago`. "Today" and every displayed time use it.                   | `src/platform/lib/timezone.ts` |
| Today         | The current calendar date in the site timezone, as midnight UTC (to match how event dates are stored). | `startOfToday()`               |

## Code structure

| Term         | Meaning                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module       | One business area's folder under `src/modules/` ([architecture](README.md)).                                                                                               |
| Entry file   | `index.ts` (types and pure rules), `server.ts` (server-only), `actions.ts` (server actions) or `cms.ts` (Payload config): the only files other code imports from a module. |
| Domain layer | `domain/`: pure rules and types, no framework.                                                                                                                             |
| Use case     | `use-cases/`: one thing a caller can do (list upcoming events, submit a form), returning the module's own types. Server-only.                                              |
| Data layer   | `data/`: server-only queries over Payload that return the module's own types.                                                                                              |
| Platform     | `src/platform/`: code every module shares.                                                                                                                                 |
