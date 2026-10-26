# Decision records

Short notes on decisions that shape the code, so they aren't argued again without new information.
Each record says what was decided, why, and what it costs. To change a decision, add a new record
that supersedes the old one; don't edit history.

| #                                                 | Decision                                                       | Date       | Status                               |
| ------------------------------------------------- | -------------------------------------------------------------- | ---------- | ------------------------------------ |
| [0001](0001-modular-monolith.md)                  | Organize code as a modular monolith by business area           | 2026-10-19 | Accepted                             |
| [0002](0002-no-repository-layer.md)               | No repository layer over Payload                               | 2026-10-19 | Accepted                             |
| [0003](0003-turnstile-robot-check.md)             | Cloudflare Turnstile for public forms, failing closed          | 2026-10-19 | Accepted                             |
| [0004](0004-email-through-smtp.md)                | Email through Mailgun SMTP; never to addresses visitors type   | 2026-10-19 | Accepted                             |
| [0005](0005-paging-with-real-links.md)            | "Load more" is a real link, with offset paging for now         | 2026-10-19 | Accepted                             |
| [0006](0006-clean-layers-and-pluggable-themes.md) | Clean layers inside each module, and pluggable themes          | 2026-10-20 | Accepted; point 5 superseded by 0012 |
| [0007](0007-email-confirmation.md)                | People confirm their email with a link; an account is optional | 2026-10-21 | Accepted                             |
| [0008](0008-compose-modules-at-the-app-level.md)  | Modules don't import each other; the app composes them         | 2026-10-21 | Accepted                             |
| [0009](0009-email-confirmation-token.md)          | Confirmation links use our own hashed token, not `auth.verify` | 2026-10-22 | Accepted                             |
| [0010](0010-contact-data-retention.md)            | Contact data is deleted on a schedule by Payload's jobs queue  | 2026-10-24 | Accepted                             |
| [0011](0011-scheduled-publishing-runner.md)       | Scheduled publishing runs in the app; pages refresh in 10 min  | 2026-10-24 | Accepted                             |
| [0012](0012-runtime-themes.md)                    | Themes switch at runtime, on two axes: mode and theme          | 2026-10-25 | Accepted                             |
| [0013](0013-cms-content-through-mappers.md)       | Blocks and heroes take plain props, mapped from the CMS        | 2026-10-26 | Accepted                             |

Template for a new record: **Context** (the problem and the forces), **Decision**, **Consequences**
(what gets easier, what gets harder), **Links** (issues, PRs, sources).
