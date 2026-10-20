# Glossary

Business terms, defined once. Code, docs, issues and the site's own wording use these meanings.
When a term's rule lives in code, the right column says where it lives today (and, after #127,
which module owns it).

## People and roles

| Term     | Meaning                                                                                                                | Where the rule lives               |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Visitor  | Anyone on the site who isn't signed in.                                                                                | n/a                                |
| Resident | A signed-in account with the `resident` role: reads published content, edits only their own profile. The default role. | `src/access/roles.ts` → `accounts` |
| Editor   | A signed-in account with the `editor` role: creates and edits content, opens `/admin`.                                 | same                               |
| Admin    | A signed-in account with the `admin` role: everything, including users, roles and deletes.                             | same                               |
| Staff    | Admins and editors together (`hasAdminOrEditor`). Staff skip the form rate limit and robot check.                      | same                               |
| Owner    | The person who approves changes by merging pull requests (see `AGENTS.md`).                                            | n/a                                |

## Content states

| Term      | Meaning                                                                                    |
| --------- | ------------------------------------------------------------------------------------------ |
| Draft     | Saved but not visible to visitors. Only staff can see drafts (`authenticatedOrPublished`). |
| Published | Visible to everyone. Stored as `_status: 'published'`.                                     |
| Scheduled | Set in Admin to publish at a later time. Needs a job runner to actually publish (#141).    |

## Events

| Term             | Meaning                                                                                                                       | Where the rule lives                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Event date       | A calendar day with no time (Payload "day only"), stored as midnight UTC, for example `2026-03-03T00:00:00.000Z` for March 3. | `src/collections/Events` → `events`                                                                                       |
| Event time       | Free text in site time, for example "6:00 PM". Not used for sorting.                                                          | same                                                                                                                      |
| Upcoming event   | A published event whose date is today or later, where "today" is the date in the site timezone.                               | `startOfToday()` in `src/utilities/timezone.ts`; today repeated in 3 files, to become one `isUpcoming` in `events` (#131) |
| Past event       | A published event whose date is before today in the site timezone.                                                            | same                                                                                                                      |
| Event category   | One of: Meeting, Social, Volunteer, Workshop, Sports & Recreation, Community, Other. Phase 2 will revise the list (#122).     | collection options and `src/utilities/eventCategories.ts` (two copies, to become one in #131)                             |
| Cancelled event  | Planned (#122): still listed, clearly marked as cancelled, never silently removed.                                            | not built yet                                                                                                             |
| Official meeting | Planned (#122): a city or county meeting, shown with a link to the official agenda.                                           | not built yet                                                                                                             |

## News and reference content

| Term          | Meaning                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------- |
| Post          | A news article (`posts`). Shown newest first by its published date.                           |
| Post category | A nested category (`categories`) a post can belong to.                                        |
| Resource      | An entry in the local directory: a link and contact for a service, by category (`resources`). |
| FAQ entry     | A question and answer, by category (`faq`).                                                   |
| Team member   | A board member or an AI agent listed on the site (`team-members`).                            |

## Forms and email

| Term                 | Meaning                                                                                                                             | Where the rule lives                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Form                 | A form built in Admin (`forms`), for example the contact form. Its email settings are visible to staff only.                        | `src/plugins/index.ts` → `contact`              |
| Submission           | What a visitor sends through a form (`form-submissions`). Always stored, even when no email goes out.                               | same                                            |
| Owner notification   | An email from a submission to an address configured in Admin (for example the association inbox), with Reply-To set to the visitor. | `src/hooks/formSubmissionGuards.ts` → `contact` |
| Visitor confirmation | An email to the address a visitor typed. Blocked today on purpose: otherwise anyone could make the site email any address.          | same                                            |
| Robot check          | Cloudflare Turnstile: an invisible check that a submission comes from a person. Fails closed.                                       | `src/utilities/turnstile.ts` → `contact`        |
| Rate limit           | At most 5 submissions per hour from one connection, and at most 30 form emails per hour site-wide.                                  | `src/hooks/formSubmissionGuards.ts` → `contact` |

## Time

| Term          | Meaning                                                                                                | Where the rule lives                     |
| ------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Site timezone | `SITE_TIMEZONE`, default `America/Chicago`. "Today" and every displayed time use it.                   | `src/utilities/timezone.ts` → `platform` |
| Today         | The current calendar date in the site timezone, as midnight UTC (to match how event dates are stored). | `startOfToday()`                         |

## Code structure

| Term         | Meaning                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Module       | One business area's folder under `src/modules/` ([architecture](README.md)).                            |
| Entry file   | `index.ts` (client-safe) or `server.ts` (server-only): the only files other code imports from a module. |
| Domain layer | `domain/`: pure rules and types, no framework.                                                          |
| Data layer   | `data/`: server-only queries over Payload that return the module's own types.                           |
| Platform     | `src/platform/`: code every module shares.                                                              |
