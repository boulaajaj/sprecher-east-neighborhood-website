# Glossary

Business terms, defined once. Code, docs, issues and the site's own wording use these meanings.
When a term's rule lives in code, the right column says where it lives today (and, after #127,
which module owns it).

## People and roles

| Term     | Meaning                                                                                                                | Where the rule lives                        |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Visitor  | Anyone on the site who isn't signed in.                                                                                | n/a                                         |
| Resident | A signed-in account with the `resident` role: reads published content, edits only their own profile. The default role. | `src/access/roles.ts` → `platform/payload/` |
| Editor   | A signed-in account with the `editor` role: creates and edits content, opens `/admin`.                                 | same                                        |
| Admin    | A signed-in account with the `admin` role: everything, including users, roles and deletes.                             | same                                        |
| Staff    | Admins and editors together (`hasAdminOrEditor`). Staff skip the form rate limit and robot check.                      | same                                        |
| Owner    | The repo owner. Decides policy and `needs owner` items, and can merge or revert anything (`AGENTS.md`).                | n/a                                         |

## Content states

| Term      | Meaning                                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft     | Saved but not visible to visitors. Only staff should see drafts: normal reads use `authenticatedOrPublished`, but until #140 is fixed any signed-in user can read drafts through the versions API. |
| Published | Visible to everyone. Stored as `_status: 'published'`.                                                                                                                                             |
| Scheduled | Set in Admin to publish at a later time. Needs a job runner to actually publish (#141).                                                                                                            |

## Events

| Term             | Meaning                                                                                                                       | Where the rule lives                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Event date       | A calendar day with no time (Payload "day only"), stored as midnight UTC, for example `2026-03-03T00:00:00.000Z` for March 3. | `src/modules/events/cms/events.ts`                                                                               |
| Event time       | Free text in site time, for example "6:00 PM". Not used for sorting.                                                          | same                                                                                                             |
| Upcoming event   | A published event whose date is today or later, where "today" is the date in the site timezone.                               | `inScope` in `src/modules/events/data/scope.ts`, with today from `startOfToday()` in `src/utilities/timezone.ts` |
| Past event       | A published event whose date is before today in the site timezone.                                                            | same                                                                                                             |
| Event category   | One of: Meeting, Social, Volunteer, Workshop, Sports & Recreation, Community, Other. Phase 2 will revise the list (#122).     | `EVENT_CATEGORIES` in `src/modules/events/domain/categories.ts`, also the collection's options                   |
| Cancelled event  | Planned (#122): still listed, clearly marked as cancelled, never silently removed.                                            | not built yet                                                                                                    |
| Official meeting | Planned (#122): a city or county meeting, shown with a link to the official agenda.                                           | not built yet                                                                                                    |

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

## Forms and email

| Term                 | Meaning                                                                                                                                                 | Where the rule lives                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Form                 | A form built in Admin (`forms`), for example the contact form. Its email settings are visible to staff only.                                            | `src/modules/contact/cms/formBuilder.ts`                                                                                                |
| Submission           | What a visitor sends through a form (`form-submissions`). Always stored, even when no email goes out.                                                   | same                                                                                                                                    |
| Owner notification   | An email from a submission to an address configured in Admin (for example the association inbox), with Reply-To set to the visitor.                     | `toSafeFormEmail` in `src/modules/contact/domain/formEmails.ts`                                                                         |
| Visitor confirmation | An email to the address a visitor typed. Blocked today on purpose: otherwise anyone could make the site email any address.                              | same                                                                                                                                    |
| Robot check          | Cloudflare Turnstile: an invisible check that a submission comes from a person. When on, any error rejects; staff skip it; off when its keys are unset. | `HumanVerifier` in `src/modules/contact/domain/humanVerifier.ts`; `TurnstileVerifier` in `src/modules/contact/cms/turnstileVerifier.ts` |
| Rate limit           | At most 5 submissions per hour from one connection (skipped when no client IP is known), and at most 30 form emails per hour site-wide.                 | `RATE_LIMITS` in `src/modules/contact/domain/rateLimits.ts`, applied in `src/modules/contact/cms/rateLimits.ts`                         |

## Time

| Term          | Meaning                                                                                                | Where the rule lives                     |
| ------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Site timezone | `SITE_TIMEZONE`, default `America/Chicago`. "Today" and every displayed time use it.                   | `src/utilities/timezone.ts` → `platform` |
| Today         | The current calendar date in the site timezone, as midnight UTC (to match how event dates are stored). | `startOfToday()`                         |

## Code structure

| Term         | Meaning                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module       | One business area's folder under `src/modules/` ([architecture](README.md)).                                                                                               |
| Entry file   | `index.ts` (types and pure rules), `server.ts` (server-only), `actions.ts` (server actions) or `cms.ts` (Payload config): the only files other code imports from a module. |
| Domain layer | `domain/`: pure rules and types, no framework.                                                                                                                             |
| Use case     | `use-cases/`: one thing a caller can do (list upcoming events, submit a form), returning the module's own types. Server-only.                                              |
| Data layer   | `data/`: server-only queries over Payload that return the module's own types.                                                                                              |
| Platform     | `src/platform/`: code every module shares.                                                                                                                                 |
