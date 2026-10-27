# 0016: Sign in with Google and Facebook through our own routes and `openid-client`

- **Date:** 2026-10-27
- **Status:** Accepted
- **Issues and PRs:** #188, #312 (the owner's provider apps), #309 (epic); the evaluation and its
  two reviews are on PR #261, which proposed this as record 0010 (that number was taken since)

## Context

The owner wants residents to sign in with Google and Facebook on the site's existing Payload
accounts (2026-10-21 and 2026-10-22, quoted on #188). On 2026-10-24 (Claude Code session, quoted
on #188) he set the terms: "Use a mature authentication solution compatible with our existing
stack. Make the technical library/plugin choice independently after evaluating security,
maintainability, and compatibility", "Preserve our existing agreed registration process", and
"email verification or social sign-in does not establish Sprecher East residency". Apple and X
stay off until he approves their cost (#312).

What must not change: the `users` collection and its roles, `/admin`, the email and password
sign-in with Payload's own cookie (Secure in production, #234), the lockout, `auth.verify` and the
verify page (#187, #289, #303, #391), and `noPasswordSignInForAgents` (#336).

Payload 3.91 has no official social sign-in. The options PR #261 compared, from each package's
published code, the npm registry and the advisory database:

- **`payload-oauth2` 1.0.21:** keeps Payload's sign-in, but checks neither `state` nor `nonce`,
  rewrites the account on every sign-in, and its create can't skip the verification email or hold
  a Facebook account back. It needs about as much code from us as our own routes.
- **`payload-auth` 3.0.0 (Better Auth):** every provider by config, but it turns Payload's local
  sign-in off for every account, admins included, and `better-auth` had about twenty advisories
  (it would need `>=1.6.22`).
- **`payload-authjs` 0.10.2 (Auth.js 5, still beta):** turns the local sign-in off by default and
  forces text ids; four advisories in July 2026, two critical.
- **`payload-auth-plugin` 0.7.13:** no X, its own password fields, and its Facebook path reads a
  `sub` Facebook doesn't send and skips `email_verified`.
- **Our own routes with `openid-client`:** nothing of Payload's is replaced. `openid-client` is
  certified for OpenID Connect and checks `state`, `nonce`, PKCE and the ID token itself.

## Decision

- **Two routes per provider, in the accounts module, with `openid-client` 6.8.8** (MIT, no
  advisories, one maintainer, panva, as for every candidate):
  `GET /auth/<provider>` starts a sign-in and `GET /auth/<provider>/callback` finishes it. They
  are Next.js routes in `src/app/(frontend)/auth/` that call the module's use cases, rather than
  Payload endpoints, so the code can use the module's data layer and Next's cookies like the rest
  of the accounts module.
- **Payload's own session.** The callback signs the person in as Payload's `login` does once a
  password matched: a session on the account (`addSessionToUser`), Payload's token (`jwtSign`,
  `getFieldsToSign`) and Payload's cookie (`generatePayloadCookie`). Payload's `local-jwt` then
  reads it; no strategy is added. The callback answers a small page of ours that moves on to
  `/account` (a meta refresh and a link, no script) rather than a redirect: the provider's
  return is a cross-site navigation, and a redirect would carry that on, so Payload's CSRF check
  (`Sec-Fetch-Site`) would ignore the new cookie on the account page.
- **A provider is on only when both its keys are set** (`GOOGLE_CLIENT_ID` and
  `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`). Without them the buttons
  don't show and the routes send the person back to `/login`.
- **This is our own code, the fourth step of the ladder** ([development](../../guidelines/development.md#native-first-then-plugins-then-our-code)):
  the plugin that keeps Payload's sign-in leaves the checks that matter to us anyway, and the
  others replace it. About 250 lines plus tests; the protocol is the library's.

## Consequences

**The rule** (`decideSocialSignIn`, a pure function with its tests):

- **The identity is the provider plus its subject** (`googleSub`, `facebookSub`), never the email.
  A returning person is found by it, and nothing on the account changes.
- **The subject columns are unique**, so one provider account opens one account, even after a
  race or a reused link. They are hidden and server-only (`serverOnlyFieldAccess`, #299).
- **No account is linked by its email.** Linking an existing account from `/account`, while
  signed in, is later work.
- **Google:** refused unless `email_verified` is exactly `true`. A new address gets a resident
  account created verified, with no verification email; an address an account already uses is
  refused with "log in with your email and password". Google confirmed the email, so only its
  owner reads that.
- **Facebook** gives no verified flag, so its email counts as unconfirmed, and the agreed sign-up
  stays: email, a confirmation link, a password, then the account opens. A new address gets an
  unverified account and Payload's usual verification email, and the verify page asks for a
  password, as for a resent link (#289). An unverified account with that email gets its link
  resent, within the same cap. A verified account with that email gets nothing. All three answer
  "check your email", so the answer doesn't say whether an account uses the address.
- **The link cookie.** The Facebook subject goes on the account only when its link is opened in
  the browser that signed in with Facebook. That browser keeps a signed cookie with the provider,
  the subject, the account id and the email the link went to, for 24 hours. The verify action
  links only when the account and email match, then clears it. A link opened in another browser
  confirms the email and links nothing, and someone else's link opened on a shared computer
  doesn't match. So someone who controls a Facebook account but not the inbox can't take the
  address.
- **Refused accounts:** a locked account (#140), an unverified one and an agent (#336) are never
  signed in to. The callback doesn't run Payload's `beforeLogin` and `afterLogin` hooks; the only
  one, `noPasswordSignInForAgents`, is checked by the rule itself.
- **Roles:** every create sets `role: 'resident'` and the context flag `socialSignIn`, and the
  `residentOnlyFromProviders` hook forces `resident` on such a create, so a mistake can't grant
  more. The flag can only lower a role. A provider never sets residency (#314).
- **Limits:** a new account from a provider counts against the sign-up limits (5 per connection,
  20 site-wide per hour, separate counters). There's no robot check: the provider's own sign-in
  stands in for it.
- **OAuth-only accounts have no known password.** Change password on `/account` asks for the
  current one, so it isn't theirs to use; forgot password, which proves the inbox, is.

**The flow cookie:** `state`, a PKCE verifier and a `nonce` (Google uses all three; Facebook
`state`, since the pages read don't promise PKCE for it), signed, HttpOnly, SameSite=Lax, Path
`/auth`, Secure in production, ten minutes, used once. Both cookies are signed with HMAC-SHA256
under keys derived from `PAYLOAD_SECRET` for each purpose, so neither reads as the other or as a
Payload token. Failures go to `/login?social=<code>` with a fixed message; the provider's error is
logged, never shown (security guidelines).

**Costs:** one dependency (`openid-client`, with `jose` and `oauth4webapi`), our code to keep, and
Facebook's Graph API version (v26.0) to move forward when Meta retires it. Apple would need
`form_post` (a cross-site POST, so a SameSite=None flow cookie) and the paid developer program.

## Owner steps

The keys go in the server's `.env.local` through an `infra` issue, never in GitHub. The step by
step instructions are on #312.

- **Google** (free): Google Cloud Console → Google Auth Platform: an External consent screen with
  `openid`, `email` and `profile`, published, then a **Web application** client with the
  authorized redirect URIs `https://sprechereast.com/auth/google/callback` and
  `http://localhost:3000/auth/google/callback`. These scopes need no verification review.
- **Facebook** (free): Meta for Developers → an app with the "Authenticate and request data from
  users with Facebook Login" use case, `public_profile` and `email`, and the valid OAuth redirect
  URI `https://sprechereast.com/auth/facebook/callback` (Strict Mode, HTTPS). Going Live needs a
  display name, contact email, privacy policy and terms URLs, an icon, a category and the app's
  purpose.

## Links

- PR #261 (evaluation, reviews 5621940301 and 5628806416), #188, #312
- `openid-client`: https://github.com/panva/openid-client
- Payload 3.91.0 read in `node_modules/payload`: `auth/operations/login.js`, `auth/sessions.js`,
  `auth/extractJWT.js`
- Meta: https://developers.facebook.com/docs/facebook-login/security,
  https://developers.facebook.com/blog/post/2026/07/29/introducing-graph-api-v26-and-marketing-api-v26/
- Google: https://support.google.com/cloud/answer/15549257 (redirect URI rules)
