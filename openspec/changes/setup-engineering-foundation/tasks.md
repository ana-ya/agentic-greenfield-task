# Tasks

Tasks marked **[owner]** need the repository owner (account or settings access). Agents prepare and verify them but don't perform them. "Record in the PR" means add the observation to the PR description under **Які практики Agentic Engineering застосовано → верифікація**.

## 1. Runtime pin and repository hygiene

- [ ] 1.1 Run `node -v` on the owner's machine; if it's below 22.12 or not 22.x, switch with a version manager (`nvm install 22 && nvm use 22`) first (design A7); verify `node -v` prints `v22.x` with x ≥ 12
- [ ] 1.2 Add `.nvmrc` containing `22` and `"engines": { "node": ">=22.12 <23" }` to `package.json`; verify by inspection that both declare major 22, and that `npx semver -r ">=22.12 <23" 22.12.0 22.20.0 20.18.0 23.1.0` prints only the two 22.x versions
- [ ] 1.3 Bump `@types/node` from `^20` to `^22` and reinstall; verify `npm ls @types/node` shows 22.x and `npx tsc --noEmit` passes
- [ ] 1.4 Add `.fallow/` to `.gitignore`; verify `git status --porcelain` no longer lists `.fallow/`
- [ ] 1.5 Delete the stray `types/` folder (only after the owner approves the deletion prompt, design A4) and remove its workarounds: `"types"` in `tsconfig.json` `exclude`, `"types/**"` in `eslint.config.mjs` ignores, and `"types/**"` in `.fallowrc.json` `ignorePatterns`; verify `npx tsc --noEmit`, `npm run lint` and `npx fallow --only dead-code` pass and `git grep -n "types/\*\*"` returns nothing

## 2. Unit testing (TC-STACK-05)

- [ ] 2.1 Install exact dev dependencies `vitest@5.1.1` and a `vite` version within Vitest's peer range; verify `npm ls vitest vite` shows no peer-dependency warnings
- [ ] 2.2 Add `vitest.config.mts` per design D-1 (node environment, `include: ["lib/**/*.test.ts"]`, `@/` alias to the repo root) and the scripts `test` (`vitest run`) and `test:watch` (`vitest`); verify `npx vitest run --passWithNoTests` exits 0 and `npm test` returns without waiting for input
- [ ] 2.3 Run `npx fallow --only dead-code --fail-on-issues`; add `vite` to `.fallowrc.json` `ignoreDependencies` (reason: Vitest peer, never imported) and, only if test files are reported as unused, an `entry` pattern `lib/**/*.test.ts` (design D-3); verify the command exits 0
- [ ] 2.4 Add `lib/format.test.ts` covering `temp` (17.6 → «18°», −0.4 → «0°»), `hiLo` («18° / 9°»), `weekday` («Сб» for "2026-11-28"), `dayLabel` («Сб, 28 лист.»), `RangeError` from `weekday`/`dayLabel` for non-`YYYY-MM-DD` input, and `weekendRange` (same month "2026-11-28"/"2026-11-29" → «28–29 листопада»; across months "2025-05-31"/"2025-06-01" → «31 травня – 1 червня»); verify `npm test` and `TZ=America/Los_Angeles npm test` both pass
- [ ] 2.5 Add `lib/comfort.test.ts` covering `clampScore` (NaN → 0, Infinity → 0, −5 → 0, 150 → 100, 49.5 → 50) and `comfortLevel` at 39/40/69/70 (poor «Некомфортно», fair «Терпимо», fair, good «Комфортно»); verify `npm test` passes
- [ ] 2.6 Add `lib/cx.test.ts` (joins truthy classes; drops `false`, `null`, `undefined` and empty strings) and `lib/environment.test.ts` asserting `typeof document` and `typeof window` are `"undefined"`; verify `npm test` passes
- [ ] 2.7 Prove the failure path: temporarily break one assertion, run `npm test`, confirm a non-zero exit with the file and test title in the output, then revert; record the output in the PR

## 3. Framework-free `lib/` (TC-PURE-01)

- [ ] 3.1 Add the `lib/**/*.{ts,tsx}` block to `eslint.config.mjs` per design D-2 (`no-restricted-imports`, `no-restricted-syntax` for `import()`/`require()`, `no-restricted-globals`; every message prefixed `TC-PURE-01:`); verify `npm run lint` passes on the current tree
- [ ] 3.2 Prove each lint scenario with throwaway probe files, run `npm run lint` per probe, then delete them: `lib/__probe.ts` with `import { useState } from "react"`, with an import from `next/navigation`, with `await import("react")`, and with `window.innerWidth` (each → TC-PURE-01 error); `components/__probe.tsx` importing `react` (→ no TC-PURE-01 error). Verify `git status` shows no probe files and record the five results in the PR
- [ ] 3.3 Document the rule in `AGENTS.md` (Layout section: "`lib/` is framework-free, enforced by lint and a DOM-less test runtime"); verify `npm run lint` passes

## 4. Verification command (NFR-DX-01, NFR-DX-03)

- [ ] 4.1 Add scripts `typecheck` (`tsc --noEmit`), `health` (`fallow --only dead-code --fail-on-issues`) and `verify` (`npm run lint && npm run typecheck && npm test && npm run health && npm run build`) per design D-3; verify `npm run verify` exits 0 on the clean tree
- [ ] 4.2 Prove fail-fast with temporary edits, one at a time and each reverted: a lint error (stops at lint), a type error (stops at typecheck with file and line), an unused export in `lib/` (stops at health and names it), an unused devDependency (`npm i -D left-pad`, then uninstall; stops at health and names it), duplicated code in two files with no dead code (health passes), and a build-only error (call `useState` in `app/page.tsx`, a Server Component, without `"use client"`: lint, types and tests pass, `next build` fails; stops at build). Record the six results in the PR. The failing-test case is covered by 2.7
- [ ] 4.3 Measure locally with `rm -rf .next && time npm run verify` and record the duration in the PR (the authoritative budget is the CI measurement in 5.2)
- [ ] 4.4 Update `AGENTS.md` "Commands and verification": `npm run verify` as the definition of done, plus `test`, `test:watch`, `typecheck` and `health`, and a note that a full `npx fallow` (duplication, complexity) stays advisory; verify every command listed there runs as written

## 5. Continuous verification on pull requests (NFR-DX-02)

- [ ] 5.1 Add `.github/workflows/verify.yml` per design D-4 (`pull_request` + `push` to `main`; `permissions: contents: read`; `concurrency` per ref with `cancel-in-progress: true`; `timeout-minutes: 10`; `setup-node` from `.nvmrc` with npm cache; `npm ci`; `npm run verify` as its own step); verify by inspection against the "Workflow configuration is safe" scenario, and that `grep -n "secrets\." .github/workflows/verify.yml` returns nothing
- [ ] 5.2 Open this change's PR to `main` and confirm the first CI run is green, its log shows Node `v22.x` (x ≥ 12), and the `npm run verify` step took under 60 s; if Fallow reports a missing `@fallow-cli/linux-x64-gnu`, add `@fallow-cli/linux-x64-gnu@3.47.0` to `optionalDependencies` and re-run (design Risks); record the duration in the PR
- [ ] 5.3 Prove the red paths on the PR, reverting each: push a failing test (check fails, log names the test); push a `package.json` dependency without updating the lockfile (install step fails, verify step doesn't run). Confirm the check turns green after each revert

## 6. Deployment (TC-DEPLOY-01, BC-DEMO-01)

- [ ] 6.1 **[owner]** Import `ana-ya/agentic-greenfield-task` into Vercel (Next.js preset, production branch `main`, no environment variables); verify the first production build succeeds and its log shows Node 22.x
- [ ] 6.2 **[owner]** Turn off Deployment Protection for previews on this project (design D-6, assumption A2); verify a preview URL opens in a private window without a Vercel sign-in page
- [ ] 6.3 On this change's PR, confirm: the Vercel status links a preview URL; a new commit produces a new preview; the preview's browser console has no errors or warnings on load (NFR-OBS-01 baseline for the placeholder page). Record the preview URL in the PR
- [ ] 6.4 Add a "Deployments" section to `AGENTS.md`: where previews appear (the PR's Vercel status), the rule that every milestone demo uses a preview opened in a private window, and a placeholder for the production URL; verify the section reads correctly

## 7. Integration check (before merge)

- [ ] 7.1 On the final PR head, confirm together: CI verification green, Vercel preview public, `npm run verify` green locally, and `openspec validate setup-engineering-foundation --strict` passes; record the four results in the PR

## Workflow follow-up

- After merge: confirm the production URL serves the merged commit and opens in a private window; fill in the production URL in `AGENTS.md` "Deployments".
- Set NFR-DX-01, NFR-DX-02, NFR-DX-03, TC-STACK-05, TC-PURE-01, TC-RUNTIME-01 and TC-DEPLOY-01 to `shipped` in `docs/requirements.md`, with a change-log line.
- Archive the change (`openspec archive setup-engineering-foundation`) so `quality-gates` and `deployment` become main specs, then verify `openspec list --specs` shows both.
- The failed-production-build scenario is a property of Vercel (D-6). Observe it if it happens naturally; don't break `main` on purpose.
- Optional (design Open Questions): turn on branch protection for `main` requiring the "verify" check.
