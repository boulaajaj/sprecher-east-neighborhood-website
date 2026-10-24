# 0011: Scheduled publishing runs in the app every minute; pages also refresh every 10 minutes

- **Date:** 2026-10-24
- **Status:** Accepted. Settles the point decision 0010 left to #141 (scheduled publishing's queue).
- **Issues and PRs:** #141

## Context

Pages, posts and events have Payload's `schedulePublish`, so an editor can pick a time to publish
or unpublish. The Admin's Schedule button queues Payload's built-in `schedulePublish` task without
naming a queue, so it lands in `default`. Decision 0010 started a runner for the `retention` queue
only, so nothing ran `default`: a scheduled item never changed (#141).

Checked on a local production build (2026-10-24, recorded on #141): with a runner on `default`,
a post scheduled two minutes ahead was published on the next minute. The post's `afterChange`
hook ran, but the cache wasn't refreshed: `/posts` and the post's page still showed the old
content. Next.js refreshes its cache only for `revalidatePath` and `revalidateTag` called in a
Route Handler or a Server Function, and Payload's runner calls them from a timer, outside any
request. Those pages had no time limit, so an unpublished post would have stayed online.

## Decision

- **A second runner in `jobs.autoRun`**, for the `default` queue, every minute (the Admin's time
  precision), at most 10 jobs a run, in the app's one PM2 process. One publish is one document
  update; a run takes milliseconds, and Payload never starts a run while the previous one is
  still going. The runners are listed in one place, `src/platform/payload/jobRunners.ts`, pinned by
  its test. No runner takes every queue: work nobody decided to run stays queued.
- **Pages, posts, events and the home page re-render at most every 10 minutes**
  (`revalidate = 600`), as the lists already do, and the sitemap's cached lists expire after 10
  minutes too. So a scheduled change reaches every page and the sitemap within 10 minutes, and
  the hooks still refresh the cache at once for changes made in Admin.
- **Not chosen:** running the jobs through Payload's `/api/payload-jobs/run` route from a system
  cron with a secret (the Payload website template's way on Vercel). It would refresh the cache at
  once, but it needs a secret on the server, a crontab outside the deploy, and a second way jobs
  run. Ten minutes is acceptable for neighborhood news; it can be revisited if editors need
  to the minute.

## Consequences

- Scheduling works: an item changes in Admin within a minute of its time, and visitors see it
  within 10 minutes (the first visit after that may still get the old page while the new one
  renders).
- A page cached as "not found" before it was published shows within 10 minutes too.
- Every visited page re-renders at most once every 10 minutes: negligible load.
- A scheduled publish that fails validation (a required field left empty) fails once and stays
  in the job's error; the item stays a draft.

## Links

- Payload jobs queue: https://payloadcms.com/docs/jobs-queue/overview (`autoRun`, `queue`)
- Next.js `revalidateTag` ("can be called in Server Functions and Route Handlers"):
  `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`
- Payload source read (3.91.0): `payload/dist/index.js` (`_initializeCrons`, `protect: true`),
  `@payloadcms/ui/dist/utilities/schedulePublishHandler.js` (queues without a queue name)
- Code: `src/platform/payload/jobRunners.ts`, `src/payload.config.ts`
