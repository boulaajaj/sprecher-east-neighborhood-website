# 0007: Residents confirm with an email link, then get a resident account

- **Date:** 2026-10-21
- **Status:** Accepted
- **Issues and PRs:** #168 (decision), #183 (sign-up), #162, #164

## Context

Several features need to know a person is real and signs up once: "Get involved" (#162), one vote
per resident in the photo contest (#164), and a confirmation for people who write in. The site has
no public sign-up today; accounts are made in the admin panel.

The options were an email link (free, through the existing Mailgun account) and a text-message code
(harder to fake, but every message costs money and needs a paid SMS service).

## Decision

The owner decided on 2026-10-21 (quoted on #168):

- **An email link, for now.** A person proves they own an address by clicking a link we email them.
  No text messages.
- **A branded email:** a welcome and confirmation email that reads as Sprecher East.
- **An account on confirmation:** once the link is clicked, the person gets an account with the
  `resident` role, without admin access.

How it's built safely (the agents' design, following [0003](0003-turnstile-robot-check.md) and
[0004](0004-email-through-smtp.md)):

- No account exists until the link is clicked. The link is single-use and expires.
- The account's role is always `resident`. The role field stays admin-only
  (`src/access/roles.ts`), and a test fails if sign-up can produce any other role.
- The email has fixed text, goes to the one validated address the person typed, and is sent by the
  sign-up feature itself. Form-builder emails keep 0004's rule: never to addresses visitors type.
- The sign-up form has the robot check and the size and rate limits of the contact form, plus a
  limit per address, so the site can't be used to flood someone's inbox.

## Consequences

- It's free and uses the email setup that already works.
- Someone with several addresses can still sign up more than once, so a one-person-one-vote contest
  is weaker than with a phone code. A phone check can be added later if that matters.
- Sign-up depends on email delivery (Mailgun). A failed send must say so, not pretend it worked.
- Fixing edit locks (#147) comes first, because residents will have accounts.

## Links

- Decision: #168. Build: #183, in the accounts module (#134) once it exists.
