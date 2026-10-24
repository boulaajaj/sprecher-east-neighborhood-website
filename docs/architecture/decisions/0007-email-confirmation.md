# 0007: People confirm their email with a link; an account is optional

- **Date:** 2026-10-21 (updated 2026-10-23 with the sign-in foundation, #266)
- **Status:** Accepted
- **Issues and PRs:** #168 (decision), #266 (sign-in foundation), #183 (email confirmation), #187
  (account offer), #162, #164

## Context

People who write in or sign up need to show the email is theirs. The photo contest (#164) needs
one vote per person. The site has no public sign-up today; accounts are made in the admin panel.

The options were an email link (free, through the existing Mailgun account) and a text-message code
(harder to fake, but every message costs money and needs a paid SMS service).

## Decision

The owner decided on 2026-10-21 (quoted on #168):

- **An email link, for now.** No text messages.
- **The same robot check on the contact form and sign-up,** with the one Turnstile key pair
  ([0003](0003-turnstile-robot-check.md)). The person gets a link, and clicking it marks the email
  verified.
- **The welcome email comes after the click:** a Sprecher East welcome or "thanks for reaching out".
- **An account is offered, not imposed:** after confirming, the person is asked whether they want
  an account. Yes leads to a read-only `resident` account; who may comment is decided later. No
  creates nothing, and the email stays verified.
- **Verified emails can create an account later** without the confirmation step again. The account
  is finished with one click on a link sent to that inbox, so nobody can claim someone else's
  address (Claude's suggestion, which he accepted).
- **Use what exists first:** Payload's built-ins or an established library.
- **Accounts use Payload's own sign-in** (decided 2026-10-23, quoted on #266): sign-up is
  Payload's `create` with `auth.verify`, and password resets use its forgot and reset password.
  How Yes and the one-click link fit with it was settled on 2026-10-23 (option A, quoted on
  #187): Yes opens the sign-up page with the email filled in, and Payload's verify link is the
  one click, a second confirmation by design. No custom tokens.
- **Opening the link is enough** (decided 2026-10-23, quoted on #300): `/confirm-email` and
  `/verify-account` confirm as soon as the page loads, with no button to press. The page's own
  script posts the token, so a scanner that only fetches the link confirms nothing.

Contact-form senders aren't accounts, so their confirmation link uses the site's own token
([0009](0009-email-confirmation-token.md)): Payload's `auth.verify` only works for accounts.

## Consequences

- It's free and uses the email setup that already works.
- Someone with several addresses can still act more than once, so a one-vote contest is weaker
  than with a phone code. A phone check can be added later if that matters.
- Before the click, the only email sent to a typed address is the short confirmation link. Emails
  set up in the form builder keep [0004](0004-email-through-smtp.md)'s rule.
- The two kinds of link are separate: contact senders use the site's own token (0009), accounts
  use Payload's verify email.
- Payload 3.91's forgot password emails an account whether or not it confirmed its address, so an
  unconfirmed sign-up could aim reset emails at someone else's inbox. #187 stops reset emails to
  unconfirmed accounts, with a test.
- A mail scanner that runs the page's script (some workplace filters do) can now confirm on the
  person's behalf, though nobody at that address clicked. For a contact sender, the scanner sends
  the welcome, releases the emails that address's messages were holding (#287) and marks the
  sender confirmed. For a first sign-up link, it could open an account someone else started with
  that address (#290).
- The technical rules are acceptance criteria in #183 and #187, checked in review.
- Edit locks (#147) are fixed before any resident account exists.

## Links

- Decision: #168, and #266 for the sign-in foundation. Build: #183, then #269, #187 and #300. Later:
  sign in with Google, Apple and X (#188).
