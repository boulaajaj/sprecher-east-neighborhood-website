// The checks the Claude Code hooks run (#446). Pure functions, tested in rules.test.mjs; the hook
// scripts beside this file only read stdin and call them. CI stays the real gate: these catch the
// same mistakes earlier, inside the session that makes them.

/** Commands AGENTS.md forbids ("Never"), each with the reason shown to the agent */
const FORBIDDEN = [
  {
    test: /\bgh\s+pr\s+merge\b[^\n]*--admin\b/,
    reason: 'AGENTS.md: never merge with --admin; merge with rules enforced (bypass_rules: false).',
  },
  {
    test: /bypass_rules["']?\s*[:=]\s*["']?true\b/,
    reason: 'AGENTS.md: never bypass a rule; merge with bypass_rules: false.',
  },
  {
    // `git push origin main`, `git push origin HEAD:main`, `git push -f origin refs/heads/main`
    test: /\bgit\s+push\b[^\n;&|]*[\s:/](main|master)(?=\s|$|;|&|\|)/,
    reason: 'AGENTS.md: never push to main; work on a branch and open a pull request.',
  },
]

/**
 * Why a Bash command must not run, or null when it may.
 * @param {string} command
 */
export function forbiddenReason(command) {
  if (typeof command !== 'string') return null
  for (const rule of FORBIDDEN) if (rule.test.test(command)) return rule.reason
  return null
}

/** Whether a Bash command makes a commit (including `git commit -a`), so staged files matter */
export function isCommit(command) {
  return typeof command === 'string' && /\bgit\s+(-C\s+\S+\s+)?commit\b/.test(command)
}

/** Whether the commit stages every tracked change itself (`-a`, `-am`, `--all`) */
export function commitsAll(command) {
  return /\bgit\s+(-C\s+\S+\s+)?commit\b[^\n;&|]*(\s-[a-zA-Z]*a[a-zA-Z]*\b|\s--all\b)/.test(command)
}

/** The generated types file that `next dev` rewrites without Prettier */
export const GENERATED_TYPES = 'src/payload-types.ts'

/** Files the after-edit hook formats, and the subset ESLint also checks */
const FORMAT = /\.(tsx?|jsx?|mjs|cjs|json|css|md|ya?ml)$/
const LINT = /\.(tsx?|jsx?|mjs)$/

/** @param {string} file */
export function shouldFormat(file) {
  return typeof file === 'string' && FORMAT.test(file)
}

/** @param {string} file */
export function shouldLint(file) {
  return typeof file === 'string' && LINT.test(file)
}
