# Roadmap

What the site is working toward, in order. The [vision](vision.md) says why. **GitHub holds the
live status:**

- **Milestones:** dated outcomes.
- **Epics:** issues labeled `epic`, with their sub-issues.
- **[The project board](https://github.com/users/boulaajaj/projects/2):** the current sprint. It's
  private, so only the owner's account can open it.

This file lists only the milestones and their epics, as a snapshot. GitHub is the source: this
command prints the open epics by milestone, and the tables below must match it. Update the tables
when an epic is added, rescheduled or finished, not as work moves. How the levels fit together is in
[how we work](../process/project-management.md).

```bash
gh api "repos/{owner}/{repo}/issues?labels=epic&state=open&per_page=100" \
  -q 'sort_by(.milestone.due_on // "9999") | .[] | "\(.milestone.title // "No milestone")\t#\(.number) \(.title)"'
```

## Milestone 1: Ready for neighbors (due 2026-11-30)

[Milestone on GitHub](https://github.com/boulaajaj/sprecher-east-neighborhood-website/milestone/1)

The site is useful and inviting enough to promote across the neighborhood.

| Epic                                                                                                                     | Outcome                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [#161](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/161) News, events and city council updates | A resident can find this week's events, the latest civic update and the forum in one click.                           |
| [#162](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/162) Get involved                          | A resident can sign up to help, on a phone, in under two minutes.                                                     |
| [#163](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/163) Shared component library              | Every screen in this milestone is built from one tested set of components, chosen from an inventory of the live site. |
| [#89](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/89) Run the project on GitHub               | The board, the conventions and the move off Asana are done.                                                           |
| [#169](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/169) Owner actions                         | Everything that needs the owner's login, money or decision is done or decided.                                        |

## No milestone

| Epic                                                                                                                | Why it has no milestone                                                 |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [#164](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/164) Photo contest                    | Not scheduled yet. It needs resident sign-up first (#183).              |
| [#127](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/127) Reorganize the code into modules | Under way. Foundation work, done step by step alongside the milestones. |
| [#181](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/181) Keep the site safe and running   | Ongoing upkeep: server, backups and dependencies.                       |
| [#182](https://github.com/boulaajaj/sprecher-east-neighborhood-website/issues/182) Agents stay inside the rules     | Ongoing: guardrails, lean agent context and review checks.              |

New ideas start as GitHub issues: a new capability as an epic, anything smaller under the epic it
belongs to. An epic gets a milestone when it's planned.
