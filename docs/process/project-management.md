# How we work: planning and tracking

How work is organized on GitHub: what each level means, how a sprint runs, what the board shows,
and when work is ready or done. It applies to every person and agent. How a change reaches `main`
is in [`AGENTS.md`](../../AGENTS.md). Where the work is heading is in the
[roadmap](../product/roadmap.md).

GitHub is the only tracker. Asana is retired (#89).

## Levels of work

| Level         | Answers                                            | Size           | On GitHub                                            |
| ------------- | -------------------------------------------------- | -------------- | ---------------------------------------------------- |
| Vision        | Why does the site exist?                           | years          | [`docs/product/vision.md`](../product/vision.md)     |
| Milestone     | What outcome do we deliver, by when?               | 1–3 months     | A milestone with a due date                          |
| Epic          | What capability is part of that outcome?           | weeks          | An issue labeled `epic`, with sub-issues             |
| Feature, task | What does a user get? What single change ships it? | a day or a few | A sub-issue of an epic; one PR closes it             |
| Bug           | What's broken?                                     | any            | A sub-issue of the epic it belongs to, or on its own |

Rules:

- **Every feature, task and bug belongs to an epic.** The exception is a quick bug fix with no
  natural home.
- **Every planned epic belongs to a milestone.** Unscheduled epics wait in the backlog with no
  milestone.
- **Milestones are dated outcomes, not topics.** Topics are epics and area labels. Sprints are not
  milestones; they're the board's Sprint field.
- **One PR closes one issue** (`Closes #N`). A PR that's one of several uses `Part of #N`.
- **Split ahead of time.** Split anything that won't finish within one sprint. An epic's features
  become sub-issues when they're planned, not all up front.

## Labels

The allowed labels are in [`.github/label-policy.json`](../../.github/label-policy.json):

- **Required on every issue:** exactly one type, at least one area, and one priority. The
  `PR Policy` check enforces this for linked issues.
- **Markers** (optional, with a fixed meaning):
  - `epic`: a parent issue whose sub-issues are the work.
  - `needs owner`: needs the owner's login, money or decision. Agents can't do it. Every
    `needs owner` issue sits in the owner-actions epic (#169), and the issues that depend on it
    are marked **blocked by** it, so nobody starts them too early.

Priority lives only in the `priority:` label. GitHub's issue types (Bug, Feature, Task) can be set
in the web UI. Agents in cloud sessions can't set them, so the type label stays the required one.

## Sprints

- **One week**, Monday to Sunday, starting 2026-10-26. A sprint is the board's **Sprint** field.
- **Planning (Monday):** pick **Ready** items, highest priority first, enough for the week. Leave
  room for bugs.
- **Review (end of the week):** the "Done last 7 days" view is the report of what shipped.
- **Retro (end of the week):** one thing to keep, one to change. A change becomes a rule (a PR to
  the right doc) or a task, never a loose note.

## The board

GitHub Project "Sprecher East", owned by `boulaajaj`. The full setup is in #90.

| Status      | Means                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| Backlog     | Captured, not ready yet.                                                          |
| Ready       | Meets the Definition of Ready (below). Can go into a sprint.                      |
| In progress | Someone (person or agent) is working on it. A PR may be open as a draft.          |
| In review   | The PR is open and waiting for its independent review or checks.                  |
| Done        | Merged, deployed and verified. Closing the issue or merging the PR moves it here. |

- **Fields:** Status, Sprint, Size (S is under half a day, M is 1–2 days, L is up to 3 days),
  plus the built-in Labels, Milestone, Parent issue and Sub-issue progress.
- **Views:** This sprint (board), Backlog (grouped by epic), Roadmap (by milestone), and Done last
  7 days.
- **Work in progress:** at most two items **In progress** per person or agent. Finish before
  starting something new.
- **Access:** only Claude Code on the owner's computer, signed in with `gh` and the `project`
  scope, can create the board and change its fields. Agents in cloud sessions can't reach a
  board on a personal account, so they keep issue state, labels, parents and milestones right,
  and the board's automations do the rest.

## Definition of Ready

An issue is **Ready** when it has:

- what and why, in plain language
- acceptance criteria someone else could check
- a parent epic, labels (type, area, priority) and a size
- no open blocker: nothing it's **blocked by** is still open

## Definition of Done

An issue is **Done** when:

- its PR has passed every required check and its independent review, and is merged
  ([`AGENTS.md`](../../AGENTS.md))
- the deploy succeeded and the changed behavior was checked on the live site (the
  [`wrapped`](../../.agents/skills/wrapped/SKILL.md) skill)
- the issue is closed with a summary of what changed. Server changes are recorded on the
  issue, without secrets.

## Reports

- **Weekly:** the "Done last 7 days" view, plus what's in progress and what's Ready next.
- **Milestone progress:** the share of its issues that are closed, shown on the milestone page.
- **Per sprint:** the board's burn-up chart (Insights).
- **What shipped in a period:** the issues closed between two dates, each with its closing summary.

## Delegating work

- An issue is the brief. Its acceptance criteria are the definition of done for whoever picks it
  up, person or agent.
- Before starting, read the issue's epic, milestone and sprint. If it isn't Ready, make it Ready
  first or pick another issue.
- New work found along the way becomes a new issue at the right level, with a parent. Don't widen
  the current PR to cover it.
