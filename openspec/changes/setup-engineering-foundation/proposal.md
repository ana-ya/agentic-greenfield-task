# Proposal

## Why

Every later change in the roadmap (`docs/implementation-roadmap.md`, M0) has to be **verified** and **demonstrated**. The repo can't do either today. There is no unit-test runner or `npm test` script, no single command that checks a change, nothing enforcing that `lib/` stays framework-free (TC-PURE-01), no independent check on pull requests, and no preview URL. Building features first would mean writing their tests and gates afterwards. Doing it now makes maker ≠ checker real from the first feature onwards.

## What Changes

- Add a unit-test runner for `lib/` with `npm test` (single run), a watch mode and a coverage report (TC-STACK-05).
- Add one verification command, `npm run verify`. It runs lint, typecheck, unit tests, a code-health check (Fallow) and the production build, in that order, and stops at the first failure (NFR-DX-01).
- Enforce TC-PURE-01: lint rejects React, Next.js and browser globals inside `lib/`, and unit tests run without a DOM.
- Pin the Node.js major version (22) for local work, CI and hosting.
- Run `npm run verify` on every pull request and every push to `main` in a clean CI environment, with the result shown on the PR.
- Connect the repo to Vercel: a preview URL per pull request, production from `main`, publicly viewable, no secrets required (TC-DEPLOY-01, BC-DEMO-01, NFR-COST-01).
- Repository hygiene: ignore the `.fallow/` cache and remove the stray committed `types/` folder along with the excludes that work around it.
- Add first unit tests for the existing pure helpers (`lib/format.ts`, `lib/comfort.ts`, `lib/cx.ts`). They prove the runner works and pin down current behaviour.
- **BREAKING (tooling only):** the project requires Node.js 22.12 or later. `@types/node` moves from `^20` to `^22`.

Not in this change (each has its own roadmap change): the strings move to `lib/i18n/` and the layout slots (`add-app-shell`); forecast domain types and Open-Meteo fixtures (`define-forecast-contract`); the comfort-score model (`add-comfort-score`); browser-level console and accessibility checks (per-milestone chrome-devtools MCP recordings, TC-STACK-05).

## Capabilities

### New Capabilities
- `quality-gates`: the repository's verification contract. Which commands exist, what they check, how they fail, how fast they run, how framework-free `lib/` is enforced, and that every pull request is checked by an independent CI run.
- `deployment`: how the app reaches the web. Preview per pull request, production from `main`, public access, no secrets, a pinned runtime.

### Modified Capabilities
None. There are no existing specs (`openspec/specs/` is empty).

## Impact

- **Code and config:** `package.json` (scripts, devDependencies, `engines`), `package-lock.json`, new `vitest.config.mts`, new `.nvmrc`, `eslint.config.mjs` (a `lib/` purity block, removing the `types/**` ignore), `tsconfig.json` (removing the `types` exclude), `.fallowrc.json` (removing the `types/**` ignore), `.gitignore`, new `lib/*.test.ts`, new `.github/workflows/verify.yml`, `AGENTS.md` (commands and deployments).
- **Removed:** the `types/` folder (a stray copy of Next's generated types; nothing imports it).
- **New dev dependencies:** `vitest`, `vite` (Vitest's peer), `@vitest/coverage-v8`. No runtime dependencies change.
- **External systems:** GitHub Actions on the fork, and a Vercel project connected through its Git integration. Both need one-time setup by the repo owner.
- **Requirements implemented:** NFR-DX-01, TC-STACK-05, TC-PURE-01, TC-DEPLOY-01, BC-DEMO-01 (deployment part). NFR-COST-01 is checked by the "no secrets" scenario.
