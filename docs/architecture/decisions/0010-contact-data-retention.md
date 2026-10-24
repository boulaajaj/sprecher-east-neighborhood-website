# 0010: Contact data is deleted on a schedule, by Payload's own jobs queue in the app

- **Date:** 2026-10-24
- **Status:** Accepted. Replaces the retention answer recorded on #274 on 2026-10-23 (keep a
  confirmed address until the person asks).
- **Issues and PRs:** #274 (decision), #287 (messages wait for the click), #141 (scheduled jobs)

## Context

People who write in leave their name, address and message. Until now an unconfirmed address
was deleted 7 days after its link, only when someone else asked for or clicked a link, and a
confirmed address and every message were kept until someone asked for removal.

The owner decided on 2026-10-24, 08:42 CT, in a Claude Code session (text, quoted on #274):

> "Retain confirmed contact information for 12 months after the last interaction, with automatic
> deletion unless an active matter or applicable retention requirement justifies keeping it
> longer. Delete unconfirmed submissions after a short expiration period, such as 48 hours."

Nothing ran Payload's jobs queue yet (#141), so "automatic" needed a runner.

## Decision

- **The rules** live in one place, `src/platform/lib/retention.ts`, because two modules apply
  them:
  - `contact`: an unconfirmed message is deleted 48 hours after it was sent, and any other one
    12 months after its sender's last message. Unconfirmed means not confirmed, with a sender
    address or a form that asks for one, so rows stored before #183 recorded the address count.
    A message from a form with no email field has no sender to identify: it goes 12 months after
    it was sent (an agent's reading; the owner's words don't cover it). Staff can tick
    `retentionHold`, with a reason, to keep one longer.
  - `verification`: an unconfirmed address is deleted 48 hours after its last link. A confirmed
    one is deleted once it is 12 months old and no keeper still needs it. `contact` keeps the
    addresses that still have a stored message, and `accounts` the ones an account uses
    (`ConfirmedEmailKeeper`, composed in `payload.config.ts`, decision 0008).
- **48 hours is longer than a link works (24 hours)**, so a link never outlives its record, and
  someone who resends within the 48 hours still gets their earlier message through.
- **The runner is native Payload.** Each module brings a task with a `schedule` (hourly), and
  `jobs.autoRun` runs only the `retention` queue every 10 minutes inside the app's one PM2
  process. No package, no separate worker, no system cron. Payload starts it on the first request
  through its own routes after a start (any `/api/` request, including every image, and the
  admin), never during `next build`.
- **Scheduled publishing stays out of it.** It uses the default queue, which still has no runner;
  that is #141's decision.
- **Deletion no longer runs on requests.** The hourly task replaces it.
- **Deletes re-check as they delete.** Each one is a single `DELETE … WHERE` through the
  database adapter (`payload.db.deleteMany`), with the rule's conditions in the `where`, so a hold
  set or a confirmation made after the task chose a row keeps it. One gap is accepted: a contact
  message stored while the confirmation task waits for its keepers isn't seen, so that sender may
  be asked to confirm once more next time (milliseconds, once an hour; no message is lost).
- **Failures carry no address.** A failed query's message lists its parameters, and Payload logs
  a task's error and stores it on the job, so each task replaces the error with one that names
  only the task, the error and its code (`withoutPersonalData`).
- **A job cut off mid-run is picked up again.** Payload 3.91 has no processing timeout, and it
  counts a job left `processing` as running, so the task would never be scheduled again. The
  schedule's `beforeSchedule` hook (`releaseStuckJobs`) puts such a job back in the queue after an
  hour, logs a warning, then runs Payload's default check. Re-running a task is safe.
- Payload adds the global `payload-jobs-stats` for scheduled tasks, with any signed-in user
  allowed; `restrictJobStats` makes it admin-only, as `restrictEditLocks` does for edit locks.

## Consequences

- Personal data no longer piles up, and nobody has to remember to delete it.
- A message from a sender who never clicks is gone after 2 days. The confirm page says so when a
  link is dead, and the form tells every sender to check their email.
- The "we received your message" email counts toward the same hourly form-email cap as the
  owner's notifications. Within one message the owner's email goes first, so only a busy hour
  with many confirmed senders reaches the cap sooner.
- If the app serves no Payload request after a restart, nothing runs until one comes. The first
  run catches up, since the schedule looks at when the task last ran.
- The site has no privacy page yet, so these rules aren't published to visitors. That's the
  owner's call.

## Links

- Payload jobs queue: https://payloadcms.com/docs/jobs-queue/overview (`autoRun`, `schedule`)
- Payload source read (3.91.0): `payload/dist/index.js` (`_initializeCrons`),
  `payload/dist/queues/operations/handleSchedules/index.js`
- Code: `src/modules/contact/cms/retention.ts`, `src/modules/verification/cms/retention.ts`,
  `src/modules/accounts/cms/keepAccountEmails.ts`, `src/payload.config.ts`
