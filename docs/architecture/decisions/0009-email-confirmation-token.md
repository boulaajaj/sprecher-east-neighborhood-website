# 0009: Confirmation links use the site's own hashed token, not Payload's `auth.verify`

- **Date:** 2026-10-22
- **Status:** Accepted
- **Issues and PRs:** #183 (design comment on the issue), #168, #187

## Context

People who write in or sign up confirm their email with a link (#168, decision record 0007 in
#186). The owner asked for Payload's built-ins or an established library first. The candidate
was Payload's `auth.verify` on a collection of verified emails, with `generateEmailSubject` and
`generateEmailHTML`. Payload 3.91's code shows what it would mean:

- The collection becomes a second login collection, so every `req.user` could be a verified email
  as well as an account. The role checks compare ids (`isAdminOrSelf`), so they would all need
  to tell the two apart, or a verified email with id 7 could act as account 7.
- It needs a password per record, and it adds login, forgot-password and reset endpoints.
  Forgot-password would email any address stored there, which breaks "the only email before the
  click is the confirmation link".
- The token never expires. A reused link gets the same "invalid" error as an unknown one.
  `verifyEmail` writes straight to the database, so no hook runs to send the welcome email. A
  second request for the same address is refused.

## Decision

- A plain collection, `email-confirmations`, in the `verification` module, written through the
  Local API.
- The token: 32 random bytes in the link. Only its SHA-256 is stored, with an expiry 24 hours
  after sending. A new link replaces the old one, and the hash is kept after use, so a reused link
  can say "already confirmed".
- Limits per connection, per address and site-wide (`CONFIRMATION_LIMITS`). Over a limit nothing
  is sent, and the person gets the same answer.
- Payload still does the rest: storage, the admin screen, access rules and `payload.sendEmail`
  through the SMTP adapter ([0004](0004-email-through-smtp.md)).
- Other modules get it through `EmailConfirmer` (`src/platform/payload/emailConfirmer.ts`), which
  `payload.config.ts` hands to them ([0008](0008-compose-modules-at-the-app-level.md)).

## Consequences

- No change to who `req.user` can be, and no extra auth endpoints.
- The token code is ours to keep correct: about 20 lines, unit-tested.
- Payload's `auth.verify` stays the right tool for accounts in `users` (#187).

## Links

- Payload source read: `payload/dist/auth/operations/verifyEmail.js`,
  `payload/dist/auth/sendVerificationEmail.js` (3.91.0)
- Code: `src/modules/verification/`
