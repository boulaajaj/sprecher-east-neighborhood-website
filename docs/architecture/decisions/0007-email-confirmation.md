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
- **One flow for every form:** the contact form and sign-up use the same robot check, with the one
  Turnstile key pair ([0003](0003-turnstile-robot-check.md)). The person gets a link, and clicking
  it marks the email verified.
- **The welcome email comes after the click:** a Sprecher East welcome or "thanks for reaching out".
- **An account is offered, not imposed:** after confirming, the person is asked whether they want
  an account. Yes creates a read-only `resident` account; who may comment is decided later. No
  creates nothing, and the email stays verified.
- **Verified emails can create an account later** without verifying again. The account is still
  finished through a link sent to that inbox, so nobody can claim someone else's address (Claude's
  suggestion, which he accepted).
- **Use what exists first:** Payload's built-ins or an established library. Custom code only with a
  written reason on the issue.

## Consequences

- It's free and uses the email setup that already works.
- Someone with several addresses can still act more than once, so a one-vote contest is weaker
  than with a phone code. A phone check can be added later if that matters.
- Before the click, the only email sent to a typed address is the short confirmation link. Emails
  set up in the form builder keep [0004](0004-email-through-smtp.md)'s rule.
- The technical rules (hashed single-use codes that expire, limits, cleanup of unconfirmed
  submissions, generic messages) are acceptance criteria in #183 and #187, checked in review.
- Edit locks (#147) are fixed before any resident account exists.

## Links

- Decision: #168. Build: #183, then #187. Later: sign in with Google, Apple and X (#188).
