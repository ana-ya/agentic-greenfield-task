<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Weather Explorer — agent guide

Next.js 16 (App Router, Turbopack, Cache Components) + React 19 + Tailwind CSS v4 + TypeScript.
Product: one calm Ukrainian-first screen that says whether this weekend's trip is worth it (see `docs/design-system/README.md`).

## Read before you change things

| Task touches… | Read first |
| --- | --- |
| Anything visual — markup, styles, copy, icons, layout | `DESIGN.md`, then the component's spec in `docs/design-system/components/<Name>/README.md` |
| Next.js APIs, routing, data fetching, config | `node_modules/next/dist/docs/` (see block above) |
| React performance patterns | `.agents/skills/vercel-react-best-practices/` |
| Product scope / requirements | `docs/product-brief.md`, `docs/requirements.md` (still empty — ask before inventing scope) |

## Design-system rules (summary — DESIGN.md is authoritative)

- `docs/design-system/` is a read-only export. Never edit it; tokens come from `docs/design-system/tokens.css` via `app/globals.css`.
- Use token utilities (`bg-surface-raised`, `text-ink-muted`, `rounded-md`, `shadow-card`) and type classes (`title`, `body`, `data`…). No hex values, no Tailwind default colours, no `text-<size>`.
- Reuse `@/components/design-system` before writing new markup; add every new component to `/design-system`.
- All UI strings go in `lib/strings.ts`: Ukrainian, no exclamation marks, no emoji, units on every number.
- `accent` colours are for the weekend only. Comfort is always number + word (`<ComfortBadge>`). Errors are calm `<Notice>`s.
- No third-party requests (fonts are self-hosted via `@fontsource`; no `next/font/google`, no CDNs).

## Layout

- `app/` — routes; `app/globals.css` (Tailwind + token mapping), `app/styles/wx-components.css` (component CSS)
- `components/design-system/` — React design-system components and icons
- `lib/` — `strings.ts` (all copy), `comfort.ts`, `format.ts`, `cx.ts`
  - `lib/` is framework-free (TC-PURE-01): no React, no Next.js, no browser globals. Lint rejects them (`TC-PURE-01:` errors), and unit tests run without a DOM. Put anything that needs them in `components/` or `app/`.
  - Unit tests sit next to their module as `*.test.ts` (Vitest, Node environment).
- `docs/` — product docs and the design-system export

## Commands and verification

Use Node.js 24 (see `.nvmrc`; `nvm use`) and npm ≥ 11.21 (`npm install -g npm@11`; npm 12 needs Node ≥ 24.15). Older npm 11 drops WebAssembly-only entries from `package-lock.json`, and CI's `npm ci` then rejects it. Install with `npm ci`; run `npm install` only to change dependencies, and commit the lockfile it writes.

- **Definition of done: `npm run verify`.** It runs, stopping at the first failure: `lint` → `typecheck` → `test` → `health` → `build`. CI runs the same command on every pull request and push to `main` (`.github/workflows/verify.yml`), and it must stay under 60 s on a clean checkout (NFR-DX-01).
- `npm run dev` — dev server.
- `npm run lint` — ESLint, including the TC-PURE-01 rule for `lib/`.
- `npm run typecheck` — `next typegen && tsc --noEmit` (route types such as `LayoutProps` are generated first, so it also works on a clean checkout).
- `npm test` — unit tests once (Vitest); `npm run test:watch` while working.
- `npm run health` — Fallow gate: dead code, unused or unlisted dependencies, unresolved imports, cycles (NFR-DX-03).
- `npm run build` — production build.
- For UI changes, also check `/design-system` (plus the page you changed) in light **and** dark at 390px and 1280px, with no console errors and no requests to hosts other than the app's own.
- Full code health, advisory: `npx fallow` adds duplication and complexity to the gate's checks. In Claude Code it runs automatically after every Edit/Write via `.claude/hooks/fallow-post-edit.sh` (wired in `.claude/settings.json`); findings come back to you — fix the ones your change caused, re-run `npx fallow`, and suppress intentional ones with a `fallow-ignore` comment plus a reason. Other agents: run it yourself before calling work done. Config is `.fallowrc.jsonc` (JSON with comments): the design-system export is excluded, the `components/design-system` barrel is treated as public API, and the few design-system exports kept for upcoming features are listed there with a reason — remove an entry once the export is used. Don't add ignores to silence a finding — fix it, or use a `fallow-ignore` comment with a reason.

## Deployments

> **Status: planned, not connected yet.** The Vercel project doesn't exist until the owner imports the repo (tasks 6.1–6.3 of `setup-engineering-foundation`, deferred until the app has something to demo). Until then there are no preview or production URLs, and verification relies on CI and local runs.

Vercel, through its Git integration (TC-DEPLOY-01). No environment variables or secrets are needed (NFR-COST-01). Once connected:

- **Previews:** every pull request to `main` gets one. The link is in the PR's Vercel deployment status, and a new commit produces a new preview.
- **Production:** every commit on `main` deploys to _production URL — added after the first merge_. A failed build leaves the previous production deployment live.
- **Demo rule (BC-DEMO-01):** every milestone demo uses a preview or production URL opened in a **private window**. It must load without any Vercel sign-in, and its console must stay silent (NFR-OBS-01). If a sign-in page appears, Deployment Protection has been switched back on for previews.
