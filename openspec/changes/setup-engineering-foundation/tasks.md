# Tasks

Tasks marked **[owner]** need the repository owner (account or settings access). Agents prepare and verify them but don't perform them.

## 1. Runtime pin and repository hygiene

- [ ] 1.1 Add `.nvmrc` containing `22` and `"engines": { "node": ">=22.12 <23" }` to `package.json`; verify `node -p "require('./package.json').engines.node"` prints the range, and that `npm ci` under Node 20 (switched with a version manager such as nvm) prints an `EBADENGINE` warning naming the required version
- [ ] 1.2 Bump `@types/node` from `^20` to `^22` and reinstall; verify `npm ls @types/node` shows 22.x and `npx tsc --noEmit` still passes
- [ ] 1.3 Add `.fallow/` to `.gitignore`; verify `git status --porcelain` no longer lists `.fallow/`
- [ ] 1.4 Delete the stray `types/` folder (only after the owner approves the deletion prompt, design A4) and remove its workarounds: the `"types"` entry in `tsconfig.json` `exclude`, the `"types/**"` ignore in `eslint.config.mjs`, and `"types/**"` in `.fallowrc.json` `ignorePatterns`; verify `npx tsc --noEmit`, `npm run lint` and `npx fallow` all pass and `git grep -n "types/\*\*"` returns nothing

## 2. Unit testing (TC-STACK-05)

- [ ] 2.1 Install exact dev dependencies `vitest@5.1.1`, `@vitest/coverage-v8@5.1.1` and a `vite` version within Vitest's peer range; verify `npm ls vitest vite @vitest/coverage-v8` shows no peer-dependency warnings
- [ ] 2.2 Add `vitest.config.mts` per design D-1 (node environment, `include: ["lib/**/*.test.ts"]`, `@` alias to the repo root, v8 coverage of `lib/**/*.ts` excluding tests, `json` + `text` reporters into `coverage/`); verify `npx vitest run --passWithNoTests` exits 0
- [ ] 2.3 Add scripts `test` (`vitest run`), `test:watch` (`vitest`) and `test:coverage` (`vitest run --coverage`); verify `npm test` returns without waiting for input
- [ ] 2.4 Add `lib/format.test.ts` covering `temp` (17.6 → «18°», −0.4 → «0°»), `hiLo`, `weekday` («Сб» for "2026-11-28", independent of `TZ` — run once with `TZ=America/Los_Angeles`), `weekday`/`dayLabel` throwing `RangeError` for non-`YYYY-MM-DD` input, `dayLabel` («Сб, 28 лист.»), and `weekendRange` (same month «28–29 листопада»; across months «31 травня – 1 червня»); verify `npm test` passes, including under `TZ=America/Los_Angeles npm test`
- [ ] 2.5 Add `lib/comfort.test.ts` covering `clampScore` (NaN → 0, Infinity → 0, −5 → 0, 150 → 100, 49.5 → 50) and `comfortLevel` at the boundaries 39/40/69/70 (poor/fair/fair/good with words «Некомфортно», «Терпимо», «Комфортно»); verify `npm test` passes
- [ ] 2.6 Add `lib/cx.test.ts` (joins truthy classes, drops `false`/`null`/`undefined`/empty); verify `npm test` passes
- [ ] 2.7 Add a test asserting `typeof document === "undefined"` and `typeof window === "undefined"` (spec: "DOM is unavailable in tests"); verify it passes
- [ ] 2.8 Prove the failure path: temporarily break one assertion, run `npm test`, confirm a non-zero exit and that the output names the file and test title, then revert; record the observed output in the PR description
- [ ] 2.9 Run `npm run test:coverage`; verify `coverage/coverage-final.json` exists and lists `lib/format.ts`, `lib/comfort.ts` and `lib/cx.ts`, and `git status` doesn't show `coverage/`

## 3. Framework-free `lib/` (TC-PURE-01)

- [ ] 3.1 Add the `lib/**/*.{ts,tsx}` block to `eslint.config.mjs` per design D-2 (`no-restricted-imports` for `react`, `react-dom`, `next` and their subpaths; `no-restricted-globals` for `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `location`; every message prefixed `TC-PURE-01:`); verify `npm run lint` passes on the current tree
- [ ] 3.2 Prove each spec scenario with throwaway probe files, deleted afterwards: `lib/__probe.ts` importing `react` → TC-PURE-01 error; importing `next/navigation` → error; reading `window.innerWidth` → error; `components/__probe.tsx` importing `react` → no TC-PURE-01 error. Verify by running `npm run lint` per probe, then confirm no probe files remain (`git status`)
- [ ] 3.3 Document the rule in `AGENTS.md` (Layout section: "`lib/` is framework-free, enforced by lint and a DOM-less test runtime"); verify the section reads correctly and `npm run lint` passes

## 4. Verification command (NFR-DX-01)

- [ ] 4.1 Add scripts `typecheck` (`tsc --noEmit`), `health` (`fallow --fail-on-issues`) and `verify` (`npm run lint && npm run typecheck && npm test && npm run health && npm run build`) per design D-3; verify `npm run verify` exits 0 on the clean tree
- [ ] 4.2 Prove fail-fast with temporary edits, each reverted: a type error → stops at typecheck with file and line, no test/build output; a failing test → stops after tests, no build output; an unused export in `lib/` → stops at health and names the export. Record the three observations in the PR description
- [ ] 4.3 Measure locally: `rm -rf .next && time npm run verify` and note the duration in the PR description (the authoritative budget is the CI measurement in 5.3)
- [ ] 4.4 Update `AGENTS.md` "Commands and verification": `npm run verify` as the definition of done, plus `test`, `test:watch`, `test:coverage`, `typecheck`, `health`; verify every command listed there runs as written

## 5. Continuous verification on pull requests

- [ ] 5.1 Add `.github/workflows/verify.yml` per design D-4 (`pull_request` + `push` to `main`; `permissions: contents: read`; concurrency group per ref with cancel-in-progress; `setup-node` from `.nvmrc` with npm cache; `npm ci`; `npm run verify` as its own step); verify the YAML references no `secrets.` (`grep -n "secrets\." .github/workflows/verify.yml` returns nothing)
- [ ] 5.2 **[owner]** Enable GitHub Actions on the fork (Settings → Actions → allow); verify by seeing the "verify" check appear on the pull request for this change
- [ ] 5.3 Confirm the first CI run is green, that its log shows Node `v22.x` (x ≥ 12), and that the `npm run verify` step took under 60 s; if Fallow's Linux binary is missing, apply the design's lockfile mitigation and re-run; record the duration in the PR description
- [ ] 5.4 Prove the red path: push a commit with a failing test to the PR, confirm the check fails and the log names the test, then push the revert and confirm it turns green (also showing the older run was cancelled if they overlapped)

## 6. Deployment (TC-DEPLOY-01, BC-DEMO-01)

- [ ] 6.1 **[owner]** Import the GitHub repo into Vercel (Next.js preset, production branch `main`, no environment variables); verify the import screen shows no required variables and the first production build succeeds with Node 22.x in its log
- [ ] 6.2 **[owner]** Turn off Deployment Protection for previews on this project (design D-6, assumption A2); verify a preview URL opens in a private window without a Vercel sign-in page
- [ ] 6.3 Confirm on this change's PR: the Vercel status links a preview URL; a new commit produces a new preview; the production URL serves `main` after merge. Record both URLs in the PR description
- [ ] 6.4 Add a "Deployments" section to `AGENTS.md` with the production URL, how previews are found (the PR's Vercel status) and the rule that every milestone demo uses a preview opened in a private window; verify the links open

## 7. Integration check

- [ ] 7.1 On the final PR head: CI verification green, Vercel preview public, `npm run verify` green locally, and `openspec validate setup-engineering-foundation --strict` passes; verify all four and tick the PRD rows touched (NFR-DX-01, TC-STACK-05, TC-PURE-01, TC-DEPLOY-01) in the PR description's traceability list

## Workflow follow-up

- After merge, set NFR-DX-01, TC-STACK-05, TC-PURE-01 and TC-DEPLOY-01 to `shipped` in `docs/requirements.md` (with a change-log line).
- Archive the change (`openspec archive setup-engineering-foundation`) so `quality-gates` and `deployment` become main specs, then verify `openspec list --specs` shows both.
- Optional (design Open Questions): turn on branch protection for `main` requiring the "verify" check.
