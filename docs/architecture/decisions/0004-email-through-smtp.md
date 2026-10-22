# 0004: Email through Mailgun SMTP; never to addresses visitors type

- **Date:** 2026-10-19
- **Status:** Accepted
- **Issues and PRs:** #104, #114

## Context

Password resets and form notifications must reach real inboxes. A form email addressed to a value
the visitor typed (`{{email}}`) would let anyone make the site send mail to any address.

## Decision

- Payload's nodemailer adapter, configured from `SMTP_*` env vars (Mailgun in production). With no
  `SMTP_HOST`, email goes to the server log (normal for local work). With an invalid setting it
  also goes to the log, with a clear `[email]` error, instead of crashing the app.
- Form emails whose To, CC or BCC come from submitted values are dropped. A From from submitted
  values is replaced by the default sender; a Reply-To from submitted values is kept only if it is
  exactly one address.
- At most 5 submissions per hour per connection and 30 form emails per hour site-wide.

## Consequences

- Owner notifications work; visitor confirmations don't, until a safe design exists (fixed text,
  one validated address, robot check on, possibly verification).
- The contact form's recipient is set in Admin, not in code.
- Amended by 0007: the site's own confirmation link may go to a typed address (see #186). Form
  emails keep the rule above.

## Links

- Code: `src/platform/email/emailAdapter.ts`, `src/modules/contact/domain/formEmails.ts`,
  `src/modules/contact/cms/guardFormEmails.ts`, `src/modules/contact/cms/rateLimits.ts`
