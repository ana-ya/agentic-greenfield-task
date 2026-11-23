# Design

## Context

See `proposal.md` (Why) for the motivation. Current state that shapes the approach:

- **Stack:** Next.js 16.4.6 (Turbopack, Cache Components), React 19.3, Tailwind 4 via `@tailwindcss/turbopack`, ESLint 9 flat config (`eslint.config.mjs`), TypeScript strict with the `@/*` path alias.
- **Scripts today:** `dev`, `build`, `start`, `lint`. No `test` or `typecheck` script, and no test files anywhere.
- **Pure helpers already in `lib/`:** `format.ts` (Intl-based, place-local dates in UTC), `comfort.ts` (level thresholds), `cx.ts`, `strings.ts`. None imports React, Next.js or DOM globals, so the purity rule lands on clean code.
- **Fallow 3.47.0** is a dev dependency with a committed `.fallowrc.json` and a Claude Code post-edit hook that runs the full analysis. Its cache directory `.fallow/` is untracked and not ignored.
- **`types/`** is a stray committed copy of Next's generated types. `tsconfig.json`, ESLint and Fallow each exclude it.
- **Repository:** `ana-ya/agentic-greenfield-task` on GitHub. It's a standalone repository (cloned from the course repo, with no fork relationship or upstream remote), so GitHub Actions are enabled by default. Work flows from feature branches to this repo's `main` through pull requests. There's a course PR template and CodeRabbit, which is advisory and not a gate. No CI workflow exists yet.
- **Hosting:** Vercel with its Git integration (TC-DEPLOY-01). `.vercel` is already in `.gitignore`.
- **Constraint from the tooling:** Vitest 5.1.1 requires Node `^22.12 || ^24 || >=26`, `vite` `^6.4 || ^7 || ^8` as a peer, and `@types/node` `^22 || >=24`. The repo has `@types/node ^20`.

## Goals / Non-Goals

**Goals:**
- One fail-fast command that later changes and agents run to prove a change is done (`npm run verify`).
- Two independent layers enforcing TC-PURE-01: a static lint rule, and a test runtime with no DOM.
- Checking by a separate party: CI runs the same command on a clean machine for every PR.
- A shareable preview URL per PR from day one.

**Non-Goals:**
- Component, browser or E2E tests (TC-STACK-05: unit tests for `lib/` only; E2E evidence is a chrome-devtools MCP recording per milestone).
- Console-silence checks (NFR-OBS-01). Each UI change checks them on its preview, and M5 audits them.
- Coverage reporting and thresholds. Added by `add-comfort-score`, which first needs them (100% of `lib/scoring`).
- Lighthouse, bundle-size or TTFB budgets (NFR-PERF-*, M5).
- Branch protection on `main`. A GitHub setting, recommended under Open Questions.

## Decisions

### D-1 · Vitest 5 in a Node environment, colocated `lib/**/*.test.ts`
Vitest is fixed by TC-STACK-05. `vitest.config.mts` sets `environment: "node"`, `include: ["lib/**/*.test.ts"]`, and `resolve.alias` mapping `@/` to the repo root, so tests import like app code. Tests sit next to their module (`format.ts` → `format.test.ts`).
- *Alternatives:* `node:test` with type stripping has no alias support and weaker reporting. Jest needs a TS/ESM transform. A separate `tests/` tree drifts from the code.
- *Versions:* `vitest` pinned exactly (5.1.1), matching the repo's style. `vite` pinned to the version npm resolves within the peer range. `@types/node` moves to `^22`.

### D-2 · TC-PURE-01 enforced by an ESLint block scoped to `lib/**`
A flat-config block with `files: ["lib/**/*.{ts,tsx}"]` turns on three core rules:
- `no-restricted-imports`: paths `react`, `react-dom`, `next`; patterns `react/*`, `react-dom/*`, `next/*`.
- `no-restricted-syntax`: `ImportExpression` and `require()` calls whose string source starts with `react`, `react-dom` or `next` (catches `import("react")`).
- `no-restricted-globals`: `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `location`.

Every message starts with `TC-PURE-01:` and says what to do instead ("keep lib/ framework-free; move this to components/ or app/"). The runtime backstop is D-1's Node environment.
- *Alternatives:* dependency-cruiser or Fallow architecture boundaries are more general but add configuration to learn. Three core rules cover the requirement exactly.

### D-3 · `verify` as a plain npm script chain, cheapest step first
```
"typecheck": "next typegen && tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest",
"health": "fallow --only dead-code --fail-on-issues",
"verify": "npm run lint && npm run typecheck && npm test && npm run health && npm run build"
```
`&&` gives fail-fast in POSIX shells and `cmd`, with no task runner. The order runs from fast to slow, so common failures show up in seconds.
- *Typecheck runs `next typegen` first* (found during apply): route types such as `LayoutProps` live in `.next/types`, which a clean checkout doesn't have, so plain `tsc --noEmit` fails in CI. `next typegen` writes them without a full build, as Next's CLI docs recommend for CI.
- *Fallow scope (NFR-DX-03):* `--only dead-code` covers dead code, dependency findings, unresolved imports and cycles, all deterministic. `--fail-on-issues` makes every such finding fail. Duplication and complexity, which can be judgement calls, stay advisory: the post-edit hook and a manual `npx fallow` still show them.
- *Config:* `vite` is installed only as Vitest's peer, so nothing imports it. Add it to `.fallowrc.json` `ignoreDependencies` with a reason. *(During apply: not needed. The config was renamed to `.fallowrc.jsonc` so its reason comments are valid JSONC for editors and linters such as Biome; Fallow reads either name.)* Test files are picked up through Fallow's Vitest support. If they're reported as unused files, add an `entry` pattern for `lib/**/*.test.ts` instead of ignoring them.
- *Alternatives:* `npm-run-all`/`turbo` add a dependency for no gain. A Vercel `buildCommand` running verify would slow every deploy and mix "is it correct" with "ship it".

### D-4 · GitHub Actions workflow `verify.yml`
Triggers are `pull_request` and `push` to `main`, with `permissions: contents: read`, `concurrency: { group: verify-${{ github.ref }}, cancel-in-progress: true }` and `timeout-minutes: 10`. One job on `ubuntu-latest`: `actions/checkout`, then `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`, then `npm ci` (which fails when the lockfile is out of sync), then `npm run verify` in a step of its own, so the log shows its duration separately from install.
- *Why Actions:* the repo is on GitHub and the status shows natively on the PR. CodeRabbit is explicitly advisory, so it can't be the gate.
- *Alternative:* rely on Vercel's build status. Rejected because it runs only `next build`.

### D-5 · Node 24 pinned in `.nvmrc` and `engines`
`.nvmrc` holds `24`. `package.json` gets `"engines": { "node": "24.x" }`. Vercel reads the major version from `engines` and builds on 24.x. npm only warns on other versions (no `engine-strict`).
- *Why 24, not 22:* first planned as 22 (≥ 22.12). During apply, the owner's machine turned out to run Node 24.10.0, and CI then failed: `.nvmrc` named 24, `engines` named 22, and npm 11 (bundled with Node 24) rejected a lockfile written by npm 10. Node 24 is the current LTS and supported by Vitest 5, Next.js 16 and Vercel, so everything moved to 24 and the lockfile is written with npm 11. It still installs with npm 10.

### D-6 · Vercel through its Git integration, zero configuration
*Moved to `weather-core` on 2026-11-24 (owner's decision) together with the `deployment` spec; kept here as the agreed approach.*
The owner imports the repo into Vercel with the Next.js preset defaults: production branch `main`, no environment variables. No `vercel.json` is needed. Preview Deployment Protection is switched off for this project so previews are public (BC-DEMO-01). Vercel keeps the last successful production deployment when a build fails, which is what the deployment spec expects. Creating the account and project is a manual owner step; agents don't create accounts.

### D-7 · Remove `types/` instead of excluding it
Nothing imports `types/`. Next.js regenerates the real files under `.next/types`. Deleting it removes three workarounds: the `tsconfig.json` exclude, the ESLint ignore and the `.fallowrc.json` ignore.

### D-8 · First tests cover existing helpers' current behaviour
These tests pin down what `lib/format.ts`, `lib/comfort.ts` and `lib/cx.ts` already do. They prove the runner and catch regressions when `add-app-shell` moves strings around. They don't redefine behaviour: the comfort-score model (FR-COMFORT-07) is out of scope.

## Risks / Trade-offs

- **[Lockfile churn between npm versions]** *(found during apply)* npm 10 and npm 11.6 write the WebAssembly fallback packages' dependencies (`@emnapi/*`) differently, and npm 11.6 drops `@emnapi/runtime`. CI's newer npm then rejects the lockfile. → The lockfile is written with npm 11.21.3 and verified with `npm ci` on npm 10.9, 11.6 and 11.21. `engines.npm: ">=11.21"` warns on older npm, and AGENTS.md says to install with `npm ci`.
- **[Fallow's native binary missing in CI]** The lockfile was written on macOS, and npm can drop other platforms' optional packages. Then `npm run health` fails with "Could not find @fallow-cli/linux-x64-gnu". → Decided fix: add `@fallow-cli/linux-x64-gnu@3.47.0` to `optionalDependencies` (it's skipped on macOS) and re-run.
- **[New tooling trips the gate]** Fallow may flag `vite` (a peer only) or the test files. → Handled in D-3 and task 2.3. Verified by running the gate right after installing.
- **[The 60 s budget grows with features]** `next build` dominates. → Every CI run records the duration, so the first change that breaks the budget is visible on its own PR.
- **[CI runner speed varies]** A run near 60 s may pass or fail by chance. → Treat runs above 50 s as a warning and look at build time before the budget is actually broken.
- **[Preview protection is easy to re-enable]** Vercel team defaults can protect previews without any code change. → The "opens without signing in" scenario is part of every milestone's demo check.
- **[Engine mismatch only warns]** On another Node version, installs still work, and Vitest then fails confusingly. → `.nvmrc`, the AGENTS.md note, and CI as the authoritative run.
- **[Trade-off: no component tests]** UI regressions aren't caught by `verify`. → Accepted per TC-STACK-05. The `/design-system` page plus MCP recordings cover visual checks.

## Migration Plan

1. Land the tooling (task groups 1–5) on a feature branch, then open a PR to `main`. The first CI run proves the gate on a clean machine.
2. The owner connects Vercel (group 6). The same PR gets its first preview URL.
3. Merge. `main` deploys to production. From the next change on, "done" means `npm run verify` green in CI plus a working preview.
4. **Rollback:** revert the merge commit. The `types/` deletion is in git history, and Vercel can promote the previous production deployment. No data is involved.

## Assumptions

| ID | Assumption | Status |
| --- | --- | --- |
| A1 | "< 60 s on a clean checkout" means dependencies installed (not counted), no `.next` cache, measured on the CI runner | **Confirmed**: now the wording of NFR-DX-01 |
| A2 | Previews may be public: no secrets, no personal data, and the course needs public demo links | Open: the owner decides in task 6.2 |
| A3 | Open-Meteo fixtures belong to `define-forecast-contract` | **Confirmed**: `capabilities.md` updated |
| A4 | Nothing depends on `types/`, so it can be deleted | Open: the owner confirms the deletion prompt in task 1.4 |
| A5 | Fallow gate limited to deterministic findings | **Confirmed**: NFR-DX-03 |
| A6 | Pull requests go from feature branches to `main` of `ana-ya/agentic-greenfield-task` (standalone repo, Actions on by default) | **Confirmed** by the owner |
| A7 | The owner's machine runs Node 24 | **Confirmed**: the owner's Node is 24.10.0 (found during apply) |

## Open Questions

- **Branch protection:** should `main` require the verification check before merging? Recommended, and a GitHub setting rather than code. It changes no spec or task here.
- **Vercel project name and URL:** chosen by the owner at import time, then recorded in AGENTS.md (task 6.4).
