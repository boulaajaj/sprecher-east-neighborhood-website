# 0010: Sign in with Google and Facebook through `payload-oauth2`

- **Date:** 2026-10-22
- **Status:** Proposed. The owner picks; nothing is built until he does.
- **Issues and PRs:** #188, #187, #183, #169 (owner actions)

## Context

The owner, 2026-10-21 (quoted on #188): "help me get that set up through payload or the payload
plugin, or whatever, that already combines all of these things. All we have to do is just add the
keys". On 2026-10-22 he added Facebook (comment on #188). Order: Google, then Facebook, Apple, X.
Free tiers only.

What must not change: the `users` collection (`auth: true`, roles `admin`, `editor`, `resident`),
the `/admin` sign-in, the email and password sign-in in `src/modules/accounts/`, which uses
Payload's `login` and Payload's own cookie (`session.ts`), and the fixes on top of it: the Secure
cookie (#234), admin-only unlock (#140) and the current-password check (#233). A new account
gets `resident` only (decision record 0007, in PR #186, and #187). Payload 3.91 has no official
social sign-in: it ships cookie, JWT and API-key strategies plus custom `strategies` (Payload docs,
authentication overview).

## Options compared

Read from each package's published code (`npm pack`, versions below) and the sources listed.

|                                              | `payload-oauth2` 1.0.21                                                                                                 | `payload-auth` 3.0.0 (Better Auth)                                                                                                     | `payload-authjs` 0.10.2 (Auth.js)                                                               | `payload-auth-plugin` 0.7.13                                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last release                                 | 2026-05-12                                                                                                              | 2026-08-05                                                                                                                             | 2026-05-29                                                                                      | 2026-05-18                                                                                                                                                                                         |
| Maintainers on npm, stars                    | 1, 196                                                                                                                  | 1, 325                                                                                                                                 | 1, 207                                                                                          | 1, 310                                                                                                                                                                                             |
| Open issues / PRs                            | 6 / 3                                                                                                                   | 17 / 2                                                                                                                                 | 1 / –                                                                                           | 14 / 3                                                                                                                                                                                             |
| Peer range                                   | `payload ^3`                                                                                                            | `payload >=3.79.1 <4`, `next >=15.4.8 <17`, `better-auth >=1.5 <2`                                                                     | `payload ^3.16`, `next ^15 \|\| ^16`, `next-auth ^5.0.0-beta.25`                                | `payload ^3.0.0`                                                                                                                                                                                   |
| SQLite                                       | Yes, its dev app uses `@payloadcms/db-sqlite`                                                                           | Through Payload's adapter; its own tests use Postgres                                                                                  | Through Payload's adapter                                                                       | Through Payload's adapter                                                                                                                                                                          |
| Google / Facebook                            | Google tested in CI; Facebook as generic OAuth2 (we write the config)                                                   | Built in                                                                                                                               | Built in                                                                                        | Built in                                                                                                                                                                                           |
| Apple / X                                    | Apple example; X needs our own token call (Basic auth)                                                                  | Built in                                                                                                                               | Built in                                                                                        | Apple built in; **no X**                                                                                                                                                                           |
| Keeps `users`, `/admin` and password sign-in | **Yes.** Adds a strategy and a subject field; Payload's local strategy stays                                            | **No.** Sets `disableLocalStrategy: true`; passwords move to Better Auth's accounts                                                    | **No** by default (`disableLocalStrategy`); also forces a text UUID `id` on `users`             | Partly. Adds its own password fields (`hashedPassword`, `hashSalt`)                                                                                                                                |
| Cookie and session                           | Payload's own token cookie (`generatePayloadCookie`), so `payload.auth()` works unchanged                               | Better Auth session cookie and a `sessions` collection                                                                                 | Auth.js cookie; Payload reads it through a custom strategy                                      | Payload token cookie, but prefixed `__<name>` unless `useAdmin`                                                                                                                                    |
| Linking to an existing email                 | Matches on the provider's subject. Optional `useEmailAsIdentity` matches on email **without** checking `email_verified` | Implicit linking when the provider says verified or is "trusted". CVE-2026-53516 (fixed 1.6.11): linked to an unverified local account | Refused by default; `allowDangerousEmailAccountLinking` opts in                                 | Refuses when the email exists. Checks `email_verified` for OIDC (Google, Apple) only; the OAuth2 path (Facebook) doesn't, and reads `sub`, which Facebook's `/me` doesn't return (it returns `id`) |
| Role for new accounts                        | Our `getUserInfo` decides what's written; `role` falls back to its default, `resident`                                  | `users.defaultRole` option                                                                                                             | Ours to add in Auth.js callbacks                                                                | Writes through `payload.db`, which skips hooks, access and defaults                                                                                                                                |
| Migrations                                   | One: a subject column per provider on `users`                                                                           | New `sessions`, `accounts`, `verifications` collections; users re-set passwords                                                        | Rebuild `users` with text ids and every relation to it                                          | `accounts` collection, new `users` fields                                                                                                                                                          |
| License                                      | MIT                                                                                                                     | MIT                                                                                                                                    | MIT                                                                                             | MIT                                                                                                                                                                                                |
| Security history                             | No advisories found. No `state` check of its own (see Consequences)                                                     | Better Auth: CVE-2025-61928 (critical, API keys, fixed 1.3.26), CVE-2026-53516 (high, linking)                                         | Auth.js, July 2026: four advisories, fixed in `@auth/core` 0.41.3 and `next-auth` 5.0.0-beta.32 | No advisories found                                                                                                                                                                                |
| Our code                                     | About 150–200 lines plus tests                                                                                          | Rewrite of the accounts module's session code                                                                                          | Medium, plus the id migration                                                                   | Medium, plus fixes we can't make in the plugin                                                                                                                                                     |

Auth.js 5 has been in beta since October 2023 (`next-auth@5.0.0-beta.0`), and `payload-authjs`'s README warns that Auth.js is now
part of Better Auth, so its stable future is unclear. Weekly download counts couldn't be read
from this session (the npm downloads API was blocked).

## Decision (proposed)

- **Use `payload-oauth2`, one instance per provider, for Google and Facebook.** It is the only
  candidate that adds social sign-in next to Payload's own auth instead of replacing it: the
  `users` collection, `/admin`, the password sign-in, the session code in `src/modules/accounts/`
  and #233, #234 and #140 stay as they are. It has no dependencies of its own (it uses Payload's
  `jose`), and turning it off with `enabled: false` removes it.
- **Skip Apple and X for now.** Apple needs the Apple Developer Program, $99 a year. X no
  longer has a free API tier for new developers (pay-per-use). Both can be added later as two
  more instances.
- **Runner-up: `payload-auth` (Better Auth).** It's the only one where four providers really are
  "just add the keys", and Better Auth is the most active project here. Choose it if that matters
  more than keeping Payload's login. It's then its own migration project: Better Auth replaces
  Payload's sign-in for every account, including admins, and existing users set new passwords.
- **Not `payload-authjs`** (beta Auth.js, local strategy off, UUID ids) and **not
  `payload-auth-plugin`** (no X, unverified Facebook email, writes that skip our hooks).

"Just add the keys" is still true for the owner: the code below is written once, and each
provider turns on when its two keys are in `.env.local`.

## Consequences

**How account linking is made safe**

- **An identity is the provider plus its subject** (`googleSub`, `facebookSub` on `users`),
  never the email. `useEmailAsIdentity` stays off.
- **No automatic linking by email.** If an account with that email exists, the plugin's create
  fails on the unique email and the person is told to sign in with their password. Connecting
  Google to an existing account comes later, from `/account`, while signed in.
- **Google:** refuse unless `email_verified` is `true`. **Facebook:** it gives no verified flag,
  so its email is treated as unverified: used for a new account only, never to link.
- **New accounts get `resident` only.** `getUserInfo` returns only the subject, email and name.
  A `beforeChange` guard on `users` keeps `role` and `email` unchanged on writes the plugin makes
  during sign-in, because the Local API skips field access.

**What we write**

- A `state` value in a short-lived cookie, checked in `callbackExtractToken`, plus PKCE where the
  provider supports it. The plugin forwards `state` but never checks it (`authorize-endpoint.js`),
  so without this, sign-in could be forged (login CSRF).
- Failures go to `/login` with a fixed generic message, never the provider's error
  ([security](../../guidelines/security.md), auth endpoints).
- Sign-in buttons as plain links (the plugin's README: not `next/link`), in the accounts module.
- Each instance is `enabled` only when both of its keys are set, so the site builds and the email
  path works without them (#188 acceptance criteria).
- Tests: a new account is `resident`; an existing email is refused; a bad `state` is refused.

**Costs and risks**

- One maintainer, and Facebook isn't in its tested list. We pin the version and re-read the
  callback code on each upgrade.
- Its dev app uses Next 15. Its endpoints are Payload endpoints, so Next 16 should only matter for
  the sign-in links; the build PR checks it.
- Every provider shares one `pkce_verifier` cookie name, so two sign-ins started at once in the
  same browser can collide. Harmless: the later one fails and is retried.

## Owner steps per provider

Keys go in `.env.local` on the server (an `infra` issue, #169), never in the repo. The redirect
URLs follow the plugin's `/api/users/<path>` pattern.

**Google: free.** Google Cloud Console (console.cloud.google.com) → Google Auth Platform: set up
the consent screen (External, scopes `openid`, `email`, `profile`), publish it. Then **Clients →
Create client → Web application**, with these authorized redirect URIs:

- `https://sprechereast.com/api/users/oauth/google/callback`
- `http://localhost:3000/api/users/oauth/google/callback`

Keys: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. These scopes are non-sensitive, so no paid
review; while the app is in Testing mode only listed test users (up to 100) can sign in.

**Facebook: free.** Meta for Developers (developers.facebook.com) → **Create app**, use case
"Authenticate and request data from users with Facebook Login". Under Facebook Login →
Settings, valid OAuth redirect URIs:

- `https://sprechereast.com/api/users/oauth/facebook/callback`
- `http://localhost:3000/api/users/oauth/facebook/callback`

Permissions: `public_profile` and `email`. To switch the app to Live, Meta asks for a privacy
policy URL and data-deletion instructions. Keys: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.

**Apple: not free. Suggest skipping.** Needs the Apple Developer Program ($99 a year). If it's
ever wanted: developer.apple.com → an App ID with Sign in with Apple, a **Services ID** (the
client id) with domain `sprechereast.com` and return URL
`https://sprechereast.com/api/users/oauth/apple/callback`, and a Sign in with Apple key (`.p8`).
Apple doesn't take `http://localhost`, so it can't be tested locally. Keys: `APPLE_CLIENT_ID`,
`APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`.

**X: no free tier for new developers. Suggest skipping.** If wanted later: X Developer Console →
a project and app with OAuth 2.0 (Web App, confidential client, the read and email scopes),
callback URLs `https://sprechereast.com/api/users/oauth/x/callback` and
`http://localhost:3000/api/users/oauth/x/callback`. Keys: `X_CLIENT_ID`, `X_CLIENT_SECRET`.

## Links

- Packages read: `payload-oauth2@1.0.21` (`callback-endpoint.js`, `authorize-endpoint.js`,
  `default-get-token.js`), `payload-auth@3.0.0` (`build-collections/users`),
  `payload-authjs@0.10.2` (`payload/collection`), `payload-auth-plugin@0.7.13` (`dist/esm`);
  providers in `@auth/core@0.41.3` and `@better-auth/core@1.7.12`
- Repos: https://github.com/WilsonLe/payload-oauth2, https://github.com/payload-auth/payload-auth,
  https://github.com/CrawlerCode/payload-authjs, https://github.com/authsmith/payload-auth-plugin
- Payload auth strategies: https://payloadcms.com/docs/v4/authentication/overview.md
- Better Auth: https://nvd.nist.gov/vuln/detail/CVE-2025-61928,
  https://advisories.gitlab.com/npm/better-auth/CVE-2026-53516/,
  https://better-auth.com/docs/authentication/twitter.md
- Auth.js: https://better-auth.com/blog/security-update-july-2026,
  https://authjs.dev/reference/core/providers (`allowDangerousEmailAccountLinking`)
- Linking risk: https://workos.com/blog/oauth-auto-link-email-account-takeover
- Facebook email as unverified:
  https://django-allauth.readthedocs.io/en/latest/socialaccount/providers/facebook.html
- Google scopes and review: https://ssojet.com/blog/google-oauth-consent-screen-issues-verification-requirements.md
- X pricing: https://www.postproxy.dev/blog/x-api-pricing-2026/
- Apple membership: https://kaspars.net/blog/sign-in-with-apple/md
- Comparison article: https://www.buildwithmatija.com/blog/which-payload-cms-auth-plugin-to-use
