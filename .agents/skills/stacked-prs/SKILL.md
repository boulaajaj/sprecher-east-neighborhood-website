---
name: stacked-prs
description: Put pull requests that depend on each other on a native GitHub stack, so GitHub enforces the order they merge in — build the branches, create or extend the stack, keep it current when a lower PR changes, and hand it over. Use whenever a change depends on another open PR, when adding a PR on top of an existing stack, or when a PR in a stack has to change.
---

# Stacked pull requests

[`AGENTS.md`](../../../AGENTS.md) requires it: **when a PR depends on another open PR, both go on a
native GitHub stack.** Writing the merge order in a PR description or a message ("merge #12
first, then #13") is never enough, because nothing stops someone from merging out of order. If
you find dependent PRs that aren't stacked, stack them.

A stack is an ordered chain of PRs in one repository. The bottom PR targets `main`; each PR above
targets the branch of the PR below it, so each PR shows only its own changes. GitHub then
enforces the order:

- PRs merge from the bottom up. Merging a PR also merges every PR below it, in order, so nothing
  can land without what it depends on. The PRs above stay open, are retargeted and rebased
  automatically.
- Branch rules and required checks apply to every PR in the stack as if it targeted `main`, so
  every layer must be green on its own.
- A stack is a single line: each PR sits on exactly one PR below it.

GitHub's documentation: [About stacked PRs](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs),
[how-tos](https://docs.github.com/en/pull-requests/how-tos/stacked-pull-requests),
[REST API](https://docs.github.com/en/rest/pulls/stacks).

## When to stack

- **Stack** when a PR needs code, configuration or a migration from another open PR, or when two
  PRs change the same lines and must land in a set order.
- **Don't stack** independent changes. Each gets its own PR on `main`, so neither waits for the
  other.
- **One issue, several PRs:** stack them. Every PR says `Part of #<issue>` except the top one,
  which says `Closes #<issue>`. Otherwise each PR closes its own issue.

## 1. Build the branches

Each branch starts from the branch below it. The bottom one starts from `main`:

```bash
git fetch origin
git switch -c agent/<role-tag>/<issue>-<first> origin/main     # layer 1
# …commit…
git switch -c agent/<role-tag>/<issue>-<second>                 # layer 2, from layer 1
```

Open each PR with its base set to the branch below (`main` for the bottom one):

```bash
gh pr create --base agent/<role-tag>/<issue>-<first> --title "<type>: <summary>" --body-file pr.md
```

To stack PRs that are already open, first set each one's base to the branch below it, from the
bottom up:

```bash
gh api -X PATCH repos/{owner}/{repo}/pulls/<number> -f base=<branch below>
```

## 2. Create or extend the stack

Any of these creates the same native stack: the GitHub website, the `gh stack` extension
(`gh extension install github/gh-stack`, then `gh stack --help`), or the REST API, which works
anywhere `gh api` does:

```bash
H='X-GitHub-Api-Version: 2026-03-10'
# Create: PR numbers from the bottom of the stack to the top.
gh api -X POST repos/{owner}/{repo}/stacks -H "$H" --input - <<<'{"pull_requests":[101,102,103]}'
# Add on top of an existing stack: only the new PRs, from the current top upward.
gh api -X POST repos/{owner}/{repo}/stacks/<stack>/add -H "$H" --input - <<<'{"pull_requests":[104]}'
# Find the stack a PR is in, or read one.
gh api "repos/{owner}/{repo}/stacks?pull_request=<number>" -H "$H"
gh api repos/{owner}/{repo}/stacks/<stack> -H "$H"
```

GitHub refuses a stack unless each PR's base is the head branch of the PR before it (the first
added PR sits on the current top). A `409` means someone else is changing the stack: wait and
retry.

## 3. Say so in each PR description

Put this line at the top of every PR body in the stack, so a reader sees the order before the
diff (GitHub also shows the stack in the PR's merge box):

```markdown
> **Layer <n> of native GitHub stack #<stack>.** It sits on #<PR below> (`<branch below>`).
> Merging it also merges every PR below it; GitHub enforces the order.
```

The bottom PR says it sits on `main`. Don't list the whole stack or its size in the line: GitHub
shows that, and the line stays true when the stack grows.

## 4. Keep the stack current

When a PR in the stack changes (a review fix, say), every PR above it must be rebased onto it,
from the bottom up. Fix a finding in the layer it belongs to, never in a higher one.

1. Before changing layer _k_, note its current head: `old=$(git rev-parse <branch k>)`.
2. Commit the fix on layer _k_.
3. For each layer above, in order: switch to it, note its head, then
   `git rebase --onto <branch below> <old head of the branch below>`. Resolve conflicts the same
   way in each layer. For a `package-lock.json` conflict, take either side and regenerate it with
   `npm install --package-lock-only --legacy-peer-deps --ignore-scripts`.
4. Run the checks on the top layer (`npx tsc --noEmit`, `npm test`, ESLint, Prettier). They cover
   every layer below it.
5. Push every changed branch in one atomic push, each with a lease on the head you noted, so
   the stack is never half-updated and nobody else's push is lost:

   ```bash
   git push --atomic origin \
     --force-with-lease=<branch k>:<old head k> --force-with-lease=<branch k+1>:<old head k+1> \
     <branch k> <branch k+1>
   ```

`gh stack rebase` followed by `gh stack push` does steps 3 and 5 for you, and the PR page on
GitHub can run the same cascading rebase on the server when there are no conflicts.

After the owner merges part of a stack, GitHub rebases the PRs left above it. Before working on
one of them again, reset your local copy to GitHub's: `git fetch origin` then
`git switch -C <branch> origin/<branch>` (only when you have no unpushed work on it).

## 5. Review and hand-off

- Each layer gets its own independent review ([`pr-review`](../pr-review/SKILL.md)) and must pass
  every check on its own.
- When the stack is ready, tell the owner which PR to merge: the top PR merges the whole stack,
  or a lower one merges only up to it. Agents never merge ([`AGENTS.md`](../../../AGENTS.md)).
- To restructure a stack (reorder, take a PR out), dissolve it with
  `gh api -X POST repos/{owner}/{repo}/stacks/<stack>/unstack -H "$H"`, which removes every
  unmerged PR from it. Then fix the bases and create it again. Don't retarget a PR inside a stack
  by hand.

## Notes

- Cross-fork stacks aren't supported: all branches must be in this repository.
- Some sandboxes block GitHub's GraphQL API, which several `gh` commands use. The REST forms above
  (`gh api repos/…`) work everywhere.
