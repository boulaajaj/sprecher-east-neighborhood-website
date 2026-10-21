# Guidelines

How code and content are written in this repo, by topic. They apply to every contributor, human or
AI agent, whatever tool they use. [`AGENTS.md`](../../AGENTS.md) has the rules for how changes
reach `main`; it wins if anything here disagrees with it.

Guidelines say how things should be. Step-by-step procedures are Agent Skills in
[`.agents/skills/`](../../.agents/skills/), and facts about the system are in
[`docs/project.md`](../project.md) and [`docs/architecture/`](../architecture/README.md).

| Guideline                                           | Read it when                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Development](development.md)                       | Always: framework first, configuration over code, DRY, failing explicitly.     |
| [Security](security.md)                             | Always: packages, input, secrets, access control, roles, the server.           |
| [Payload CMS](payload-cms.md)                       | You touch collections, blocks, heroes, hooks, fields, migrations or seed data. |
| [Next.js and Tailwind](nextjs-tailwind.md)          | You touch routes, metadata, caching, styling, design tokens, dates or images.  |
| [Components and content](components-and-content.md) | You build UI or forms, or write site content or seed data.                     |
| [UI/UX design](ui-ux-design.md)                     | You change how anything looks: hierarchy, spacing, color, accessibility.       |
| [Frontend patterns](frontend-patterns/README.md)    | You need a tested snippet for a hero, section, card, CTA, motion or backdrop.  |
| [Content marketing](content-marketing.md)           | You plan, research or write blog posts and neighborhood news.                  |
| [Asana (legacy)](asana-workflow.md)                 | A task is still mirrored in Asana. GitHub issues are the source of truth.      |

## Changing a guideline

Guidelines are policy. A change goes through the normal workflow, and the reviewer calls it out for
the owner's sign-off ([`AGENTS.md`](../../AGENTS.md), step 3). Keep each file under 250 lines and
free of tool- or model-specific instructions; those belong in a tool adapter (see
[Tool adapters](../../AGENTS.md#tool-adapters)).
