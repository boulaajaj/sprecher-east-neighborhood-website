# 0007: People confirm their email with a link; an account is optional

- **Date:** 2026-10-21
- **Status:** Accepted
- **Issues and PRs:** #168 (decision), #183 (email confirmation), #187 (account offer), #162, #164

## Context

People who write in or sign up need to show the email is theirs. The photo contest (#164) needs
one vote per person. The site has no public sign-up today; accounts are made in the admin panel.

The options were an email link (free, through the existing Mailgun account) and a text-message code
(harder to fake, but every message costs money and needs a paid SMS service).

## Decision

The owner decided on 2026-10-21 (quoted on #168):

- **An email link, for now.** No text messages.
- **One flow for the contact form and sign-up:** both use the same robot check, with the one
  Turnstile key pair ([0003](0003-turnstile-robot-check.md)). The person gets a link, and clicking
  it marks the email verified.
- **The welcome email comes after the click:** a Sprecher East welcome or "thanks for reaching out".
- **An account is offered, not imposed:** after confirming, the person is asked whether they want
  an account. Yes creates a read-only `resident` account; who may comment is decided later. No
  creates nothing, and the email stays verified.
- **Use what exists first:** Payload's built-ins or an established library.
- **Accounts use Payload's own sign-in** (decided 2026-10-23, quoted on #266): sign-up is
  Payload's `create` with `auth.verify`, and password resets use its forgot and reset password.
  Saying Yes opens sign-up with the email filled in. This replaces an earlier idea of finishing the
  account through a one-click link to a verified inbox.

Contact-form senders aren't accounts, so their confirmation link uses the site's own token
([0009](0009-email-confirmation-token.md)): Payload's `auth.verify` only works for accounts.

## Consequences

- It's free and uses the email setup that already works.
- Someone with several addresses can still act more than once, so a one-vote contest is weaker
  than with a phone code. A phone check can be added later if that matters.
- Before the click, the only email sent to a typed address is the short confirmation link. Emails
  set up in the form builder keep [0004](0004-email-through-smtp.md)'s rule.
- The technical rules are acceptance criteria in #183 and #187, checked in review.
- Edit locks (#147) are fixed before any resident account exists.

## Links

- Decision: #168, and #266 for the sign-in foundation. Build: #183, then #269 and #187. Later:
  sign in with Google, Apple and X (#188).
