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
- `docs/` — product docs and the design-system export

## Commands and verification

- `npm run dev` — dev server; `npm run lint`; `npx tsc --noEmit`; `npm run build`.
- Before you call a UI change done: lint, typecheck and build pass, and `/design-system` (plus the page you changed) looks right in light **and** dark at 390px and 1280px, with no console errors and no requests to hosts other than the app's own.
- Code health: `npx fallow` (dead code, unused deps, cycles, duplication, complexity). In Claude Code it runs automatically after every Edit/Write via `.claude/hooks/fallow-post-edit.sh` (wired in `.claude/settings.json`); findings come back to you — fix the ones your change caused, re-run `npx fallow`, and suppress intentional ones with a `fallow-ignore` comment plus a reason. Other agents: run it yourself before calling work done. Config is `.fallowrc.json`: the design-system export and `types/` are excluded, and the `components/design-system` barrel is treated as public API. Don't add ignores to silence a finding — fix it, or use a `fallow-ignore` comment with a reason.
- `types/` at the repo root is a stray committed copy of Next's generated types. It is excluded from `tsconfig.json` and eslint; don't import from it.
