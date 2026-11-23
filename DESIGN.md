# DESIGN.md — Weather Explorer

How UI is built in this repo. Read this before touching anything visual.
The design system itself lives in **`docs/design-system/`** (exported from Claude Design; `docs/Weather Explorer.zip` is the original export). This file says how it is wired into the app and which rules are non-negotiable. When this file and `docs/design-system/README.md` disagree on visuals, the design system wins — fix this file. On product behaviour and copy rules, `docs/requirements.md` (the PRD) wins over both.

## The product in one line

One calm screen that answers «чи варто їхати на ці вихідні»: a place, seven days, a comfort read per day, the weekend answered first. Ukrainian-first, practical, quiet. Nothing shouts — not the copy, not the colour, not the motion.

## Where things live

| What | Where | Edit? |
| --- | --- | --- |
| Design system source (tokens, component specs, previews) | `docs/design-system/` | No — re-export from Claude Design, then re-sync (below) |
| Tokens (CSS variables, light + dark, type classes) | `docs/design-system/tokens.css`, imported as-is by `app/globals.css` | No |
| Token reference with contrast notes | `docs/design-system/api/tokens.md`, `tokens.json` | No |
| Component specs (the rules per component) | `docs/design-system/components/*/README.md` | No |
| Component CSS (`wx-` classes) | `app/styles/wx-components.css` — port of `components/bundle.css` | Only to re-sync or fix a bug; note it in the file header |
| Tailwind ↔ token mapping, base styles, focus ring | `app/globals.css` | Yes, when a token is added |
| React components | `components/design-system/` (import from `@/components/design-system`) | Yes |
| Comfort levels, formatting | `lib/comfort.ts`, `lib/format.ts` | Yes |
| **Every UI string** | `lib/strings.ts` | Yes — the only place copy lives |
| Fonts | `@fontsource/golos-text`, `@fontsource/ibm-plex-mono`, imported in `app/layout.tsx` | — |
| Living reference page | `/design-system` (`app/design-system/page.tsx`, noindex) | Add every new component here |

## Hard rules

Breaking any of these is a bug, not a style choice.

**Copy**
- Ukrainian first; all strings come from `lib/strings.ts`. No string literals in JSX.
- No exclamation marks. No emoji (the only exception: a country flag in a search suggestion). Sentence case.
- Address the visitor with «ви» in instructions; prefer impersonal phrasing where natural («Нічого не знайдено»).
- A comfort explanation is one sentence of at most 80 characters (FR-COMFORT-03).
- Numbers carry units: `18°`, `40%`, `12 км/год`, `UV 6`, 24-hour time `06:42`. Celsius only. Hi/lo is `18° / 9°` (hi `ink`, lo `ink-muted`) — use `temp()` / `hiLo()`.
- Failures are calm and specific: what happened + what still works. Use `<Notice>`; never a toast, never an error page, never `role="alert"`.

**Colour**
- Use tokens only — never hex values, never Tailwind's default palette (it is removed), never literal `white`/`black`. Text on a fill uses the matching `on-…` token.
- `brand` (lake teal) is the only hue for action and data.
- `accent` / `accent-soft` / `accent-ink` belong **only to the weekend**: WeekendHighlight, the Sat/Sun day-card top rule and weekday, «Найкращий вибір» in CompareTable. Nothing else.
- Text pairs: `ink`, `ink-muted` on any surface; `ink-subtle` on `surface` / `surface-raised` only (fails on `surface-sunken`).
- Comfort uses exactly three fills, always with number **and** word — use `<ComfortBadge>`, never a coloured dot.
- `danger` is text + icon only. Never a red fill or banner.
- `line` is decorative; borders that bound a control use `line-strong`.

**Layout & depth**
- Mobile first. One column below 720px (`md`); 12-column grid from 1024px (`lg`); max width 1200px (`max-w-page`).
- Cards: `surface-raised` + 1px `line` + `shadow-card`; pad `p-4`, `lg:p-6`. Sections stack `gap-6` / `lg:gap-8`. Popovers use `shadow-pop`.
- Corners: `rounded-sm` badges/rows, `rounded-md` controls/day cards, `rounded-lg` section cards/map, `rounded-pill` chips.
- **No text on the animated sky.** Reading text sits on `surface-raised`; the header and hero heading sit on `bg-scrim`.
- Client-only content (the map) gets a `surface-sunken` skeleton of its exact footprint during SSR — no layout shift.

**Interaction & a11y**
- Focus ring is global (`:focus-visible` in `globals.css`): 2px `focus`, 2px offset. Do not remove outlines.
- Hover: `brand-soft` ground. Pressed: one step darker, not opacity. Disabled: 50% opacity and the label says why («Закріплено 3 з 3»).
- Loading: `surface-sunken` skeletons in the final shape; no lingering spinners.
- One `primary` button per view at most.
- Icons next to numbers carry a Ukrainian label (`<RainIcon label="Дощ" />`); decorative icons are `aria-hidden` (the default).
- Motion: sky clouds drift over 60–120 s, ≤ ~80 rain/snow particles, nothing flashes. `prefers-reduced-motion: reduce` → static gradient, no particles.

**Privacy**
- No third-party requests for fonts or assets. Fonts are self-hosted via `@fontsource`; never add a Google Fonts `<link>` or `next/font/google`.

## Using the system in code

### Tokens in Tailwind

`app/globals.css` maps tokens into Tailwind v4 with `@theme inline reference`: utilities compile to `var(--token)`, so they follow the theme automatically, and Tailwind's own palette/radii/shadows are cleared.

| Need | Write | Compiles to |
| --- | --- | --- |
| Colour | `bg-surface-raised`, `text-ink-muted`, `border-line-strong`, `bg-brand text-on-brand` | `var(--surface-raised)` … |
| Spacing (4px grid) | `p-4`, `gap-6`, `mt-3` — Tailwind's step = 4px, so `p-4` = `space-4`. Use the system's steps: 1, 2, 3, 4, 6, 8, 12, 16 | |
| Radius | `rounded-sm` / `md` / `lg` / `pill` | `var(--radius-*)` |
| Shadow | `shadow-card`, `shadow-pop` | `var(--shadow-*)` |
| Z-index | `z-(--z-sky)`, `z-(--z-content)`, `z-(--z-header)`, `z-(--z-popover)` | `var(--z-*)` |
| Breakpoints | `md:` (720px), `lg:` (1024px) — the only two | |
| Fonts | `font-sans` (Golos Text), `font-mono` (IBM Plex Mono — only for clock and small figures) | |

Charts and SVG attributes that can't read `var()` take the literal value from the matching theme column in `docs/design-system/api/tokens.md`.

### Type

Use the type classes from `tokens.css`, not Tailwind `text-<size>`:
`display` (hero, once per page) · `temp-xl` (weekend temperature) · `title` · `heading` · `body` · `body-sm` · `label` · `caption` · `clock` (mono) · `data` (mono).
They are unlayered and win over Tailwind utilities, so don't combine them with `text-sm`/`leading-*`; colour utilities (`text-ink-muted`) are fine.

### Components

```tsx
import { Button, ComfortBadge, DayCard, Notice, WeekendHighlight, CompareTable, RainIcon } from "@/components/design-system";
import { strings } from "@/lib/strings";

<WeekendHighlight title={strings.weekend.worthIt("Львів")} saturdayDate="2026-11-28" sundayDate="2026-11-29" … />
<DayCard date="2026-11-27" hi={9} lo={3} icon={<RainIcon label="Дощ" />} precipProb={80} windKmh={22} comfort={31} />
<Notice tone="error" title={strings.errors.forecast}>{strings.errors.forecastHint}</Notice>
```

- Components are server-compatible (no `"use client"`). Wrap them in a client component when you add behaviour; don't add state to them.
- A new component: spec it in the design system first (or follow the closest spec), build it on `wx-` classes or token utilities, add it to `/design-system`, export it from `index.ts`.
- Dates are the **place's** calendar dates as `"YYYY-MM-DD"` (Open-Meteo `timezone=auto`). `lib/format.ts` formats them in UTC so the visitor's time zone never shifts a day and SSR matches the client.

### Themes

`light` and `dark` follow `prefers-color-scheme`. An inline script in `app/layout.tsx` sets `data-theme` on `<html>` before first paint and tracks changes; `tokens.css` switches on it. The sky gradient does **not** follow the UI theme — it follows the place's sunrise/sunset.

## Where the app deliberately differs from the export

Keep these when re-syncing:

1. **Fonts** — self-hosted via `@fontsource` instead of the Google Fonts `@import` in `bundle.css`.
2. **«Найкращий вибір»** — rendered from `lib/strings.ts` as `.wx-best-label`, not by CSS `::after`.
3. **`weekday()` / `dayLabel()`** — take `"YYYY-MM-DD"` and use UTC; the export's `new Date(date).getDay()` shifts the day for visitors west of UTC.
4. **ComfortBadge** — `role="img"` plus `aria-label`; `aria-label` on a bare `<span>` isn't reliably announced.
5. **DayCard** — takes an `icon` node plus label instead of a WMO `code` until the WMO → Lucide mapping (PRD Appendix B) is implemented.
6. **WeekendHighlight** — takes structured `saturday` / `sunday` values plus dates; the export's props are pre-formatted strings.
7. **Comfort explanation** — exactly one Ukrainian sentence, at most 80 characters (FR-COMFORT-03). The export's sample («Тепло й сухо, легкий вітер. Гарний день для прогулянки.») is two sentences; follow the PRD.

## Re-syncing after a design-system update

1. Replace `docs/design-system/` with the new export (unzip; keep the folder name).
2. `tokens.css` is picked up as-is. If tokens were **added or renamed**, update the `@theme` mapping in `app/globals.css`.
3. Diff `docs/design-system/components/bundle.css` against `app/styles/wx-components.css` and port the changes, keeping the differences listed above.
4. Re-read the changed `components/*/README.md` files and update the React components and `lib/strings.ts`.
5. Check `/design-system` in light and dark, at 390px and 1280px.

## Open decisions

- **Weather icon set — decided:** `lucide-react` (TC-STACK-06), 12 glyphs mapped from WMO codes in PRD Appendix B, stroke width 1.75, `currentColor`. Not installed yet: add it with the forecast change, then switch DayCard back to `code`. The 4 preview glyphs in `icons.tsx` go away then; the UI icons (search, location, info, alert) stay.
- **CitySearch** is specified and styled (`wx-search` …) but not ported. It is behavioural (≈250 ms debounce, combobox keyboard model, `?lat=&lon=&name=` in the URL) and belongs with the search feature.
- **Sky background, hourly chart, map** are specified in `docs/design-system/README.md` but have no component spec yet.
- `display` is 48px with no mobile step, so the hero wraps on narrow screens. The system defines no smaller size; raise it there rather than inventing one here.
