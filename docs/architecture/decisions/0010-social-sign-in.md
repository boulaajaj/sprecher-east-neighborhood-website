# 0010: Sign in with Google and Facebook through our own Payload endpoints and `openid-client`

- **Date:** 2026-10-22
- **Status:** Proposed. The owner picks; nothing is built until he does.
- **Issues and PRs:** #188, #187, #183, #169 (owner actions)

## Context

The owner, 2026-10-21 (quoted on #188): "help me get that set up through payload or the payload
plugin, or whatever, that already combines all of these things. All we have to do is just add the
keys". On 2026-10-22 he added Facebook (comment on #188). Order: Google, then Facebook, Apple, X.
Free tiers only.

What must not change: the `users` collection (`auth: true`, roles `admin`, `editor`, `resident`),
the `/admin` sign-in, the email and password sign-in in `src/modules/accounts/` (Payload's `login`
and Payload's own cookie, `session.ts`), and the fixes on top of it: the Secure cookie (#234),
admin-only unlock (#140) and the current-password check (#233). A new account gets `resident`
only (decision record 0007, in PR #186, and #187). #187 plans Payload's `auth.verify` on `users`
([0009](0009-email-confirmation-token.md)), so a social sign-in has to say how `_verified` is set.

Payload 3.91 has no official social sign-in. It has custom auth strategies and endpoints, and
exports what a sign-in needs: `jwtSign`, `getFieldsToSign` and `generatePayloadCookie` from
`payload`, `addSessionToUser` from `payload/shared` (read in `node_modules/payload` 3.91.0).

## Options compared

Read from each package's published code (`npm pack`), the npm registry and the npm advisory
database (which mirrors GitHub's), plus the sources in Links.

|                                           | Own endpoints + `openid-client` 6.8.8                                       | `payload-oauth2` 1.0.21                                                          | `payload-auth` 3.0.0 (Better Auth)                                                                                                                                                                     | `payload-authjs` 0.10.2 (Auth.js)                                                  | `payload-auth-plugin` 0.7.13                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Last release                              | 2026-09-05                                                                  | 2026-05-12                                                                       | 2026-08-05                                                                                                                                                                                             | 2026-05-29                                                                         | 2026-05-18                                                                                            |
| npm maintainers                           | 1 (panva)                                                                   | 1                                                                                | 1                                                                                                                                                                                                      | 1                                                                                  | 1                                                                                                     |
| Peers                                     | none; deps `jose`, `oauth4webapi`                                           | `payload ^3` (uses Payload's `jose` undeclared)                                  | `payload`, `@payloadcms/next`, `@payloadcms/ui >=3.79.1 <4`; `better-auth`, `@better-auth/core`, `@better-auth/passkey >=1.5 <2`; `next >=15.4.8 <17`; `react`, `react-dom >=19.2.1 <20`; `zod ^4.3.6` | `payload`, `@payloadcms/ui ^3.16`; `next ^15 \|\| ^16`; `next-auth ^5.0.0-beta.25` | `payload ^3.0.0`                                                                                      |
| SQLite                                    | Our code, Payload's adapter                                                 | Yes (its dev app)                                                                | Payload's adapter; its tests use Postgres                                                                                                                                                              | Payload's adapter                                                                  | Payload's adapter                                                                                     |
| Google / Facebook                         | Google by OIDC discovery; Facebook as plain OAuth 2 (we list its endpoints) | Google tested; Facebook generic                                                  | Built in                                                                                                                                                                                               | Built in                                                                           | Built in                                                                                              |
| Apple / X                                 | Apple by OIDC (`form_post` supported); X as OAuth 2 with Basic auth         | Apple example; X needs our token call                                            | Built in                                                                                                                                                                                               | Built in                                                                           | Apple; **no X**                                                                                       |
| Keeps `users`, `/admin`, password sign-in | **Yes**, nothing replaced                                                   | **Yes**, adds a strategy                                                         | **No**: `disableLocalStrategy: true` always                                                                                                                                                            | **No** by default; forces text UUID `id`                                           | Partly; own password fields                                                                           |
| Checks state, nonce, PKCE, ID token       | **Yes**, the library does (certified OIDC RP)                               | No `state` check; `nonce` sent, never checked                                    | Yes (GHSA-wxw3, `state`, fixed 1.6.2)                                                                                                                                                                  | Yes (GHSA-x445, cookies not bound to provider)                                     | `state` and PKCE yes                                                                                  |
| Linking to an existing email              | Ours: never automatic                                                       | By subject; email mode skips `email_verified`                                    | Implicit linking (GHSA-g38m, fixed 1.6.11)                                                                                                                                                             | Refused by default                                                                 | Refuses existing email; Facebook path skips `email_verified` and reads a `sub` Facebook's `/me` lacks |
| Role and `_verified` on create            | Ours, explicit                                                              | Whole `getUserInfo` result, every sign-in; can't pass `disableVerificationEmail` | `users.defaultRole`                                                                                                                                                                                    | Ours, in callbacks                                                                 | Writes through `payload.db`, skipping hooks and defaults                                              |
| Cookie                                    | Payload's own                                                               | Payload's own                                                                    | Better Auth's, plus `sessions`                                                                                                                                                                         | Auth.js's                                                                          | Payload's, prefixed unless `useAdmin`                                                                 |
| Migrations                                | One: subject columns on `users`                                             | Same                                                                             | `sessions`, `accounts`, `verifications`; passwords re-set                                                                                                                                              | Rebuild `users` with text ids                                                      | `accounts`, new `users` fields                                                                        |
| License                                   | MIT                                                                         | MIT                                                                              | MIT                                                                                                                                                                                                    | MIT                                                                                | MIT                                                                                                   |
| Advisories                                | none                                                                        | none                                                                             | about 20 on `better-auth`; see below                                                                                                                                                                   | four in July 2026, two critical                                                    | none                                                                                                  |
| Our code                                  | ~250 lines plus tests                                                       | ~200 lines plus tests, around the plugin                                         | accounts session code rewritten                                                                                                                                                                        | medium, plus the id migration                                                      | medium, plus gaps we can't fix                                                                        |

- **`arctic` 3.7.0** (one maintainer, MIT) was the other library option: Google, Facebook, Apple
  and X classes with `state` and PKCE helpers, but no release since 2025-05-21, Facebook pinned to
  Graph API v16.0 and no PKCE for it, and ID tokens decoded, not checked. `openid-client` does more
  of the checking for the same code.
- **Better Auth's record**, for the runner-up: GHSA-99h5-pjcv-gr6v / CVE-2025-61928 (API keys,
  `<1.3.26`; GitHub: high, CVSS 3.1 8.6; NVD shows the CNA's CVSS 4.0 9.3, critical), and against
  1.5.0 alone ten more, including GHSA-wxw3-q3m9-c3jr (mismatched `state`, `<1.6.2`),
  GHSA-g38m-r43w-p2q7 (linking to an unverified account, `<1.6.11`), GHSA-pw9m-5jxm-xr6h
  (critical, refresh-token replay, `<1.6.11`) and GHSA-qq9h-g4jm-xgf3 (pre-account hijacking,
  `<1.6.22`). `payload-auth`'s peer range admits them all, so it would need `better-auth >=1.6.22`.
- **Auth.js 5** is still beta since October 2023; GHSA-8fpg-xm3f-6cx3 and GHSA-7rqj-j65f-68wh are
  critical, fixed in `next-auth@5.0.0-beta.32` and `@auth/core@0.41.3`.

## Decision (proposed)

- **Two Payload endpoints in the accounts module, `openid-client` for the protocol, Google and
  Facebook first (both free).** `GET /api/users/oauth/<provider>` starts a sign-in, and
  `/api/users/oauth/<provider>/callback` finishes it and sets Payload's own cookie with Payload's
  exported helpers, as `session.ts` already does. Payload's `local-jwt` then reads that cookie, so
  no new strategy runs on every request. A provider is on only when both its keys are set.
- **Why not the plugin.** [Development](../../guidelines/development.md) says "If a plugin
  exists, use it", because the plugin is maintained upstream. Here that gain is small and this is a
  departure the owner should weigh: `payload-oauth2` still needs about as much of our code, has
  one maintainer, checks neither `state` nor `nonce`, rewrites the user on every sign-in, and its
  create call can't skip Payload's verification email or hold a Facebook account back, so we'd be
  working around it from hooks. `openid-client` is the established, actively maintained library
  for exactly the part that's easy to get wrong.
- **If he prefers a plugin:** `payload-oauth2`, with the rules below. It also needs our own start
  route to set the `state` cookie (its authorize endpoint returns its own response), a check in
  `callbackExtractToken`, no reliance on its `pkce_verifier` cookie (set without HttpOnly, Secure
  or Path) or its `nonce` (never checked), and `useSessions` kept on (Payload puts collection strategies before `local-jwt`, and the plugin's accepts any live
  Payload token) and a test that a password session still resolves the same user.
- **If he wants all four providers by config:** `payload-auth` with `better-auth >=1.6.22`, as
  its own migration: Better Auth replaces Payload's sign-in for every account, admins included.
- **Skip Apple and X for now.** Apple needs the paid developer program; X bills every API call.

## Consequences

**Account rules** (a pure, unit-tested function in the accounts module)

- **An identity is the provider plus its subject** (`googleSub`, `facebookSub`), never the
  email. A returning person is found by subject; nothing on the account is rewritten.
- **No automatic linking by email.** If an account has that email, the sign-in is refused with
  "sign in with your password". Linking comes later from `/account`, while signed in.
- **Google:** refused unless `email_verified` is `true`. A new account is created with
  `role: 'resident'`, `_verified: true` and `disableVerificationEmail: true` once #187 turns on
  `auth.verify`, so Payload sends no verification email.
- **Facebook** gives no verified flag, so its email is unverified. A sign-in for a new address
  creates no account: it sends the 0009 confirmation link through `EmailConfirmer`
  ([0008](0008-compose-modules-at-the-app-level.md)), and keeps the Facebook subject in a signed,
  HttpOnly cookie in that browser. The account (`_verified: true`) is created only when the link
  is opened in the same browser. Opened anywhere else, it confirms the email and links nothing, so
  someone who controls a Facebook account but not the inbox can't take the address.
- **Role guard:** the callback creates with `overrideAccess: true` (only admins may create users)
  and `context: { socialSignIn: true }`. A `beforeChange` hook on `users` keys on that flag and
  forces `role: 'resident'`, so a mistake in the create data can't grant more. It doesn't key on
  `req.user`: the seed and Payload's first-user screen create admins with no `req.user`.
- **OAuth-only accounts have no known password**, so `/account`'s change-password form (#233)
  isn't theirs to use; forgot-password, which also proves the inbox, is.

**The flow cookie.** The start endpoint makes `state`, a PKCE verifier (where the provider takes one)
and, for OIDC, a `nonce`,
stores them with the provider name in one cookie, HttpOnly, SameSite=Lax, Path
`/api/users/oauth`, Secure in production as in #234, ten minutes. The callback checks all three
through `openid-client`, then clears it. Failures go to `/login` with a fixed message, never the
provider's error ([security](../../guidelines/security.md)). Apple answers with `form_post`, a
cross-site POST, so a Lax cookie isn't sent: Apple's flow cookie would need SameSite=None.

**Tests:** a new Google account is `resident` and verified; an existing email is refused; a bad
or missing `state` is refused; a Facebook link opened without the browser cookie creates no
account and no link; the site builds and password sign-in works with no keys set.

**Costs:** about 250 lines of ours plus tests, and one new dependency. `openid-client` has one
maintainer, as do all the plugins. Its provider settings are ours to keep current.

## Owner steps per provider

Keys go in `.env.local` on the server (an `infra` issue, #169), never in the repo.

**Google: free.** Google Cloud Console → Google Auth Platform: consent screen (External; scopes
`openid`, `email`, `profile`), publish it. Then **Clients → Create client → Web application**,
authorized redirect URIs:

- `https://sprechereast.com/api/users/oauth/google/callback`
- `http://localhost:3000/api/users/oauth/google/callback` (Google exempts localhost from HTTPS)

Keys: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. These are non-sensitive scopes: no verification
review. Showing the site's name and logo on the consent screen needs the lighter brand
verification.

**Facebook: free.** Meta for Developers → **Create app**, use case "Authenticate and request data
from users with Facebook Login"; permissions `public_profile` (required) and `email`. Facebook
Login → Settings, valid OAuth redirect URI: `https://sprechereast.com/api/users/oauth/facebook/callback`.
Strict Mode is required and listed redirects must be HTTPS; the pages we read don't say whether
`http://localhost` is accepted, so try it, and use an HTTPS tunnel if it's refused. To go Live,
Basic Settings needs a display name, contact email, terms of service URL, app icon, category and
app purpose (a privacy policy URL is worth adding too). Meta requires App Review for the `user_*`
permissions; its page doesn't list `public_profile` or `email`, so check that both say "Ready for
live mode". Keys: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.

**Apple: paid. Suggest skipping.** The Apple Developer Program costs 99 USD a year, and the
Services ID and key are made in Certificates, Identifiers & Profiles, which only members get. If
wanted: an App ID with Sign in with Apple, a Services ID for `sprechereast.com` with return URL
`https://sprechereast.com/api/users/oauth/apple/callback`, and a key (`.p8`). Apple sends the
name only on the first sign-in, by `form_post`. Keys: `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`,
`APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`.

**X: billed per call. Suggest skipping.** The X API is pay-per-use with no subscriptions; a user
read costs $0.010, so every sign-in costs money. If wanted: Developer Console → an OAuth 2.0 web
app (confidential client), callbacks `https://sprechereast.com/api/users/oauth/x/callback` and
`http://localhost:3000/api/users/oauth/x/callback`. Keys: `X_CLIENT_ID`, `X_CLIENT_SECRET`.

## Links

- Packages read (`npm pack`): `openid-client@6.8.8`, `arctic@3.7.0`, `payload-oauth2@1.0.21`,
  `payload-auth@3.0.0`, `payload-authjs@0.10.2`, `payload-auth-plugin@0.7.13`, `@auth/core@0.41.3`,
  `@better-auth/core@1.7.12`; Payload 3.91.0 (`dist/index.js` strategy order,
  `collections/operations/create.js`, `auth/sessions.js`)
- Advisories: npm advisory database (`/-/npm/v1/security/advisories/bulk`);
  https://nvd.nist.gov/vuln/detail/CVE-2025-61928;
  https://advisories.gitlab.com/npm/better-auth/CVE-2026-53516/;
  https://better-auth.com/blog/security-update-july-2026
- Payload: https://payloadcms.com/docs/authentication/custom-strategies,
  https://payloadcms.com/docs/v3/authentication/overview.md
- Auth.js linking default: https://authjs.dev/reference/core/providers
- Google: https://support.google.com/cloud/answer/13463073 (verification),
  https://support.google.com/cloud/answer/15549257 (redirect URI rules)
- Meta: https://developers.facebook.com/docs/facebook-login/security,
  https://developers.facebook.com/documentation/development/create-an-app/facebook-login-use-case.md,
  https://developers.facebook.com/documentation/development/create-an-app/app-dashboard/basic-settings.md;
  Facebook email as unverified: django-allauth's Facebook provider docs (no Meta page found)
- Apple: https://developer.apple.com/support/enrollment/,
  https://developer.apple.com/support/compare-memberships,
  https://developer.apple.com/tutorials/data/documentation/signinwithapplerestapi/request-an-authorization-to-the-sign-in-with-apple-server..md
  (the "About Sign in with Apple" page couldn't be reached from this session)
- X: https://docs.x.com/x-api/getting-started/pricing.md
- Repos: https://github.com/panva/openid-client, https://github.com/WilsonLe/payload-oauth2,
  https://github.com/payload-auth/payload-auth, https://github.com/CrawlerCode/payload-authjs,
  https://github.com/authsmith/payload-auth-plugin
