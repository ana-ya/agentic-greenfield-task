# Design

## Context

See `proposal.md` (Why) for the motivation. Current state that shapes the approach:

- **Stack:** Next.js 16.4.6 (Turbopack, Cache Components), React 19.3, Tailwind 4 via `@tailwindcss/turbopack`, ESLint 9 flat config (`eslint.config.mjs`), TypeScript strict with the `@/*` path alias.
- **Scripts today:** `dev`, `build`, `start`, `lint`. No `test` or `typecheck` script, and no test files anywhere.
- **Pure helpers already in `lib/`:** `format.ts` (Intl-based, place-local dates in UTC), `comfort.ts` (level thresholds), `cx.ts`, `strings.ts`. None imports React, Next.js or DOM globals, so the purity rule lands on clean code.
- **Fallow 3.47.0** is a dev dependency with a committed `.fallowrc.json` and a Claude Code post-edit hook. Its cache directory `.fallow/` is untracked and not ignored.
- **`types/`** is a stray committed copy of Next's generated types. `tsconfig.json`, ESLint and Fallow each exclude it.
- **Hosting:** the PRD fixes Vercel with its Git integration (TC-DEPLOY-01). `.vercel` is already in `.gitignore`.
- **Repo:** a GitHub fork (`ana-ya/agentic-greenfield-task`) with a course PR template and CodeRabbit, which is advisory and not a gate. There is no CI workflow yet.
- **Constraint from the tooling:** Vitest 5.1.1 requires Node `^22.12 || ^24 || >=26`, `vite` `^6.4 || ^7 || ^8` as a peer, and `@types/node` `^22 || >=24`. The repo has `@types/node ^20`.

## Goals / Non-Goals

**Goals:**
- One fail-fast command that later changes and agents run to prove a change is done (`npm run verify`).
- Two independent layers enforcing TC-PURE-01: a static lint rule, and a test runtime with no DOM.
- Checking by a separate party: CI runs the same command on a clean machine for every PR. Locally green is not enough.
- A shareable preview URL per PR from day one, so every later milestone can be demonstrated.

**Non-Goals:**
- Component, browser or E2E tests. TC-STACK-05 limits unit tests to `lib/`, and E2E evidence is a chrome-devtools MCP recording per milestone.
- Lighthouse, bundle-size or TTFB budgets in CI (NFR-PERF-*). They become measurable only once features exist (M5).
- Coverage thresholds. The report exists now; thresholds come with the code they protect (the comfort-score change sets 100% for `lib/scoring`).
- Branch protection rules on GitHub. That's a repository setting, recommended in Open Questions but not required by the specs.

## Decisions

### D-1 · Vitest 5 in a Node environment, colocated `lib/**/*.test.ts`
Vitest is fixed by TC-STACK-05. The config is `vitest.config.mts`. It sets `environment: "node"`, a test `include` of `lib/**/*.test.ts`, coverage `provider: "v8"` limited to `lib/**/*.ts` (excluding tests) with `json` and `text` reporters into `coverage/`, and `resolve.alias` mapping `@` to the repo root so tests import like app code. Tests sit next to their module (`format.ts` → `format.test.ts`), so whoever changes a helper sees its test.
- *Alternatives:* `node:test` with type stripping has no alias support and weaker reporting. Jest needs a TS/ESM transform and is slower. A separate `tests/` tree drifts from the code.
- *Why an alias, not `vite-tsconfig-paths`:* one alias, no extra dependency.
- *Versions:* pinned exactly, matching the repo's style (`vitest`, `@vitest/coverage-v8` 5.1.1; `vite` at a release satisfying the peer range, resolved at install). `@types/node` moves to `^22` to satisfy Vitest's peer.

### D-2 · TC-PURE-01 enforced by an ESLint block scoped to `lib/**`
A flat-config block with `files: ["lib/**/*.{ts,tsx}"]` turns on `no-restricted-imports` and `no-restricted-globals`:
- `no-restricted-imports`: paths `react`, `react-dom`, `next`; patterns `react/*`, `react-dom/*`, `next/*`.
- `no-restricted-globals`: `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `location`.

Every message starts with `TC-PURE-01:` and says what to do instead ("keep lib/ framework-free; move this to components/ or app/"). The runtime backstop is D-1's Node environment.
- *Alternatives:* dependency-cruiser or Fallow architecture boundaries. They're more general but add configuration to learn, while two core ESLint rules cover the requirement exactly. Revisit if layering rules grow (e.g., `components` must not import `app`).

### D-3 · `verify` as a plain npm script chain, cheapest step first
```
"typecheck": "tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"health": "fallow --fail-on-issues",
"verify": "npm run lint && npm run typecheck && npm test && npm run health && npm run build"
```
`&&` gives fail-fast in both POSIX shells and `cmd`, with no task runner. The order runs from fast to slow (lint, tsc, tests, Fallow, build), so the common failures show up in seconds.
- *Fallow uses `--fail-on-issues`* so the code-health scenario is deterministic: any unsuppressed finding fails, not only error-severity ones. Intentional exceptions stay in `.fallowrc.json` or as `fallow-ignore` comments with a reason, as AGENTS.md already says.
- *Alternatives:* `npm-run-all`/`turbo` would add a dependency for no gain at this size. A Vercel `buildCommand` running verify would slow every deploy and mix "is it correct" with "ship it".

### D-4 · GitHub Actions workflow `verify.yml`
Triggers are `pull_request` and `push` to `main`, with `permissions: contents: read` and `concurrency: { group: verify-${{ github.ref }}, cancel-in-progress: true }`. One job on `ubuntu-latest`: `actions/checkout`, then `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`, then `npm ci`, then `npm run verify` in a step of its own, so the log shows that step's duration separately from the install. That duration is the evidence for the 60-second budget.
- *Why Actions:* the repo is on GitHub and the status shows natively on the PR. CodeRabbit is explicitly advisory, so it can't be the gate.
- *Alternative:* rely on Vercel's build status. Rejected because it runs only `next build`, not lint, typecheck, tests or code health.

### D-5 · Node 22 pinned in `.nvmrc` and `engines`
`.nvmrc` holds `22`. `package.json` gets `"engines": { "node": ">=22.12 <23" }`. Vercel reads the major version from `engines` and builds on 22.x. npm prints an engine warning, not an error (no `engine-strict`), on other versions: enough to flag the problem without locking anyone out.
- *Alternative:* `22.x` is simpler, but it would accept 22.0–22.11, which Vitest 5 doesn't support.

### D-6 · Vercel through its Git integration, zero configuration
The repo owner imports the GitHub repo into Vercel with the Next.js preset defaults: production branch `main`, no environment variables. No `vercel.json` is needed. Preview Deployment Protection is switched off for this project so previews are public (BC-DEMO-01). The app has no secrets and no user data, so there's nothing to protect. Creating the account and project is a manual owner step; agents don't create accounts.

### D-7 · Remove `types/` instead of excluding it
Nothing imports `types/`. Next.js regenerates the real files under `.next/types`. Deleting the folder removes three workarounds: the `tsconfig.json` exclude, the ESLint ignore and the `.fallowrc.json` ignore. Fallow would also flag them as dead config.

### D-8 · First tests cover existing helpers' current behaviour
These tests pin down what `lib/format.ts`, `lib/comfort.ts` and `lib/cx.ts` already do. That proves the runner and gives the `test:coverage` report real content. They don't redefine behaviour: the comfort-score model (FR-COMFORT-07) is out of scope.

## Risks / Trade-offs

- **[Fallow's native binary missing in CI]** The lockfile was written on macOS. If npm skipped the Linux optional dependency (`@fallow-cli/linux-x64-gnu`), `npm run health` fails with "Could not find @fallow-cli/…". → Check the first CI run. If it fails, regenerate the lockfile with all platforms (`npm install --package-lock-only`) or add the Linux package as an explicit optional dependency.
- **[`--fail-on-issues` is noisy]** Health thresholds or duplication can fail verify on harmless code. → Tune thresholds in `.fallowrc.json` in the PR that hits them, with a reason. Never disable the step.
- **[The 60 s budget grows with features]** `next build` dominates, and later changes add routes and data. → The budget scenario runs in every CI job, so the first change to break it fails visibly. Then split build caching or tune before adding more.
- **[Preview protection is easy to re-enable]** Vercel team defaults can protect previews, breaking BC-DEMO-01 without any code change. → The deployment spec's "opens without signing in" scenario is part of every milestone's demo check.
- **[Actions disabled on forks]** GitHub disables Actions on new forks until the owner enables them. Until then no check appears and the gate silently doesn't exist. → An explicit owner task, verified by seeing the check on the first PR.
- **[Engine mismatch only warns]** A developer on Node 20 can still install, and Vitest then fails confusingly. → `.nvmrc`, the AGENTS.md note, and CI being the authoritative check.
- **[Trade-off: no component tests]** UI regressions aren't caught by `verify`. → Accepted per TC-STACK-05. The `/design-system` page plus MCP recordings cover visual checks.

## Migration Plan

1. Land the tooling (tasks groups 1–5) on a feature branch, then open a PR. The first CI run proves the gate on a clean machine.
2. The owner enables Actions on the fork if needed, and connects Vercel (group 6). The same PR gets its first preview URL.
3. Merge. `main` deploys to production. From the next change on, "done" means `npm run verify` green in CI plus a working preview.
4. **Rollback:** revert the merge commit. The `types/` deletion is in git history, and Vercel can roll back to the previous production deployment in its dashboard. No data or schema is involved.

## Assumptions (confirm or correct)

- **A1 Timing:** NFR-DX-01's "< 60 s on a clean checkout" means after dependencies are installed (`npm ci` isn't counted) and with no `.next` build cache, measured on the GitHub-hosted CI runner.
- **A2 Public previews:** the owner accepts that previews are public. There are no secrets or personal data, and the course needs public demo links.
- **A3 Scope split:** Open-Meteo fixtures belong to `define-forecast-contract`, not here, even though `capabilities.md` §2 lists them under foundation. They need the forecast types that change defines.
- **A4 Deleting `types/`:** nothing depends on it. The apply step deletes it only after the owner confirms the deletion prompt.
- **A5 Fallow strictness:** `--fail-on-issues` is right for this project. The current tree has no findings after the earlier cleanup, to be confirmed by the first `npm run health`.

## Open Questions

- **Branch protection:** should `main` require the verification check before merging? Recommended, and a GitHub setting rather than code. It changes no spec or task here.
- **Vercel project name and URL:** chosen by the owner at import time, then recorded in AGENTS.md (task 6.4).
