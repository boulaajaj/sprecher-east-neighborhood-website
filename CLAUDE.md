# CLAUDE.md — Claude Code adapter

Claude Code reads this file automatically. It connects Claude Code to the repo's tool-neutral
guidance, which applies to every agent and human, and adds only what is specific to Claude Code.
Don't add rules, procedures or facts here: they go where
[`AGENTS.md`](AGENTS.md#where-knowledge-lives) says, so every agent sees them.

Loaded into every session:

@AGENTS.md
@docs/project.md
@docs/guidelines/development.md
@docs/guidelines/security.md
@docs/guidelines/payload-cms.md
@docs/guidelines/nextjs-tailwind.md
@docs/guidelines/components-and-content.md
@docs/guidelines/ui-ux-design.md

Read the other guidelines (frontend patterns, content marketing, Asana) when a task needs them;
[`docs/guidelines/README.md`](docs/guidelines/README.md) says when.

## Claude Code specifics

- **Skills:** each `.claude/skills/<name>/SKILL.md` is a pointer to
  `.agents/skills/<name>/SKILL.md`, so Claude Code finds the repo's skills (`simplify` is the one
  alias, below). Edit the `.agents/skills/` copy. A new skill gets a pointer too, with the same
  `name` and `description`.
- **Self-review:** `/simplify` and `/self-review` both run this repo's
  [`self-review`](.agents/skills/self-review/SKILL.md) skill, with its four reviews as parallel
  subagents. `.claude/skills/simplify/` replaces Claude Code's built-in `/simplify`, a generic check
  that doesn't apply this repo's guidelines or the visual design review. Because a project
  `simplify` skill exists, Claude Code also runs it before each commit that isn't docs or tests
  (Claude Code v2.1.286 or later; a personal `~/.claude/skills/simplify` would win over it). Run
  it again before opening or updating a PR.
- **After the owner merges,** run `/wrapped` (the [`wrapped`](.agents/skills/wrapped/SKILL.md) skill).
- **Independent review:** run the [`pr-review`](.agents/skills/pr-review/SKILL.md) skill in a
  separate session or a subagent (for example `qa-reviewer`), never in the context that wrote
  the change.
- **Waiting for checks:** poll `gh pr checks <number>` in the background (`run_in_background`),
  about once a minute and for at most 15 minutes. Don't push while waiting. If the checks still
  haven't finished after 15 minutes, tell the user.
- **Subagents:** `.claude/agents/` registers each [role guide](docs/roles/README.md) as a subagent
  Claude Code can delegate to. Those files only hold Claude Code settings; edit the guide.
- **Browser and dev server:** `.claude/settings.json` allows the Playwright MCP tools used for
  screenshots, and `.claude/launch.json` starts `npm run dev`.
