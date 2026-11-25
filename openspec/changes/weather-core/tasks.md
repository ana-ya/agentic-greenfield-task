# Tasks

Tasks marked **[owner]** need the repository owner's machine. Each group ends with `npm run verify` green. "Fixture mode" means `WEATHER_FIXTURES=1 npm run dev` (design D-9).

## 1. Dependencies

- [x] 1.1 Install `lucide-react` (exact version) with npm ≥ 11.21; verify `npm ci` passes with npm 10 and 11 and `npm run verify` is green

## 2. Strings (app-shell: centralised strings)

- [x] 2.1 Create `lib/i18n/uk.ts` from `lib/strings.ts` plus the new copy from the specs (theme indicator, invalid-location Notice, search failure, verdict bands, no-data badge and Notice, coordinate-label words), and `lib/i18n/index.ts` exporting `strings = uk`; update every import and delete `lib/strings.ts`; verify `npm run typecheck` passes and `git grep -n "lib/strings"` finds nothing outside archives
- [x] 2.2 Create `lib/i18n/en.ts` typed as `Strings` (design D-6); verify by deleting one key temporarily that `npm run typecheck` fails naming it, then restore
- [x] 2.3 Add `lib/i18n/copy.test.ts` checking every string value (string functions called with sample arguments) has no «!» and no emoji; verify `npm test` passes and fails if «!» is added temporarily

## 3. Active location (`lib/location`)

- [x] 3.1 Implement `parseLocation`, rounding, name capping and the coordinate label (design D-4); add tests for every active-location scenario (valid, missing name, out of range, non-numeric, southern/western label, 49.83826 → 49.84, 95-char name → 80); verify `npm test` passes
- [x] 3.2 Implement `hrefFor(place)` producing `/?lat=…&lon=…&name=…` with rounding and encoding; test round-trip `parseLocation(hrefFor(x))`; verify `npm test` passes

## 4. Comfort score (`lib/scoring`)

- [x] 4.1 Move bands (`clampScore`, `comfortLevel`) from `lib/comfort.ts` into `lib/scoring/`, keeping their existing tests (moved); verify `npm test` passes and `lib/comfort.ts` is gone
- [x] 4.2 Implement `comfortScore(day)` per PRD Appendix A (penalties, caps, half-up rounding, rationale selection with ties in table order, no-data rule); add one test per Appendix A reference case (11 cases incl. «Немає даних»); verify all pass
- [x] 4.3 Add property-style tests without new dependencies (loops over generated values): totality over numbers/NaN/±Infinity/missing, score 0–100 integer or no-data, monotonic in rain, every rationale ≤ 80 chars with one full stop and no «!»; verify `npm test` passes

## 5. Forecast model (`lib/forecast`)

- [x] 5.1 Define domain types in `lib/forecast/types.ts` (days with date, code, hi/lo, apparent max, precipitation, wind, UV, sunrise/sunset, daytime cloud mean; current; timezone); verify `npm run typecheck`
- [x] 5.2 Create schema-true synthetic fixtures in `lib/forecast/__fixtures__/` (normal week Львів, rainy week, a day with all comfort inputs null, Sunday "today", place UTC−10) per design D-9; verify each parses as JSON in a test
- [x] 5.3 Implement `normalizeForecast(raw)` returning ok/error: validates `daily.time` as `YYYY-MM-DD`, aligns arrays, nulls become missing, computes 09:00–18:00 cloud mean per day from hourly data, rejects missing `daily.time`; tests for each fixture plus malformed input; verify `npm test` passes
- [x] 5.4 Implement `wmo.ts` (code → icon key + Ukrainian label per Appendix B, unknown → «Невідомо»/cloud); test every code in Appendix B and code 42; verify `npm test` passes

## 6. Weekend (`lib/weekend`)

- [x] 6.1 Implement `upcomingWeekend(placeToday)` (Mon–Sat → this weekend, Sunday → next); tests for Wednesday, Saturday, Sunday and the place-vs-visitor date case; verify `npm test` passes
- [x] 6.2 Implement `weekendSummary(days, weekend)`: half-up mean, lower day's rationale, combined hi/lo, band → verdict key, no-data when either day has no score; tests for the weekend-highlight scenarios (84/72 → 78, 70/69 → 70, 55, 31, Sunday no-data); verify `npm test` passes

## 7. Server data layer and geocoding route

- [x] 7.1 Implement `lib/geocode/results.ts` (Open-Meteo search JSON → suggestions: name, region, country, flag from country code; `results` absent → empty list); fixtures «Льв» and "no results"; tests; verify `npm test` passes
- [x] 7.2 Implement `app/_data/open-meteo.ts` `getForecast` and `searchPlaces` per design D-3 (`"use cache"`, `cacheLife`, timeouts, throw on non-2xx or shape error) with fixture mode guarded by `NODE_ENV !== "production"` (D-9); put the guard in a pure `lib/forecast/fixtures-enabled.ts` (`fixturesEnabled(env)`) with tests: true only for `WEATHER_FIXTURES=1` and a non-production `NODE_ENV`, false for `production` even with `WEATHER_FIXTURES=1`; verify `npm test` and `npm run verify`
- [x] 7.3 Implement `app/api/geocode/route.ts`: `GET ?q=` → trimmed query of 2–100 chars, else `[]` without calling upstream; upstream error or timeout → `{ error: true }` with HTTP 200 and `no-store` (a 5xx would log to the browser console, which FR-SEARCH-08 requires to stay silent); verify in fixture mode with `curl` for «Льв» (suggestions), «Л» (empty, no upstream call) and «zzqqxx» (empty)

## 8. Design-system updates

- [x] 8.1 Add `WeatherIcon` (icon key → `lucide-react` icon, `role="img"` with the label, stroke 1.75); switch `DayCard` to take `code`; remove the 4 hand-drawn weather glyphs from `icons.tsx` and the now-unneeded `.fallowrc.jsonc` exemption if any becomes stale; verify `npm run verify` and `/design-system` renders the cards in fixture mode
- [x] 8.2 `ComfortBadge` accepts `score: number | null`; add the `wx-badge-none` style (surface-sunken, ink-muted, line-strong hairline) in `app/styles/wx-components.css`; show both on `/design-system`; verify `npm run verify` and the rendered HTML (the light/dark look is part of the browser pass, 9.4)
- [x] 8.3 Update `/design-system` page samples for the new props (verdict bands, no-data weekend Notice); verify the rendered HTML in fixture mode (console checked in the browser pass, 9.4)

## 9. Page and interactions

- [x] 9.1 Rebuild the shell in `app/page.tsx`: header with product name and `ThemeIndicator` (design D-8), search area, footer with linked credits; verify the rendered HTML in fixture mode (live theme switching is checked in 9.4)
- [x] 9.2 Add `ForecastSection` inside an unkeyed `<Suspense>` with `ForecastSkeleton` (design D-2): empty → hero; invalid → info Notice and no fetch; ok → weekend panel or no-data Notice + seven `DayCard`s with badges; forecast failure → error Notice; verify each state's rendered HTML in fixture mode (including the all-null fixture, Sunday today, UTC−10 and a forced failure)
- [x] 9.3 Implement `CitySearch` (design D-5): debounce, abort of stale requests, combobox keyboard model, lone-suggestion Enter, «Нічого не знайдено», failure Notice, selection via `router.push` in `startTransition`; verify `/api/geocode` with short, long, empty, failing and delayed queries (interaction is checked in 9.4)
- [x] 9.4 One browser pass in fixture mode (owner runs `WEATHER_FIXTURES=1 npm run dev`; agent uses the built-in browser at `http://localhost:3000`), with a silent console and no hydration warning throughout:
  - theme: light and dark look of `/` and `/design-system`; the indicator follows an emulated `prefers-color-scheme` change without a reload
  - states: hero, invalid link, normal week, Saturday without data, forced failure
  - search: arrows/Enter/Escape, Enter on one vs several suggestions, a new query clears the old list at once, out-of-order answers (3-letter delayed fixture), no list after the field loses focus, Back/Forward switch places without a full reload; roles and names in the accessibility tree
  - layout: a quick look at 390 px (one column, the seven cards scroll in one row) and 1280 px (centred ≤ 1200 px, seven cards in a row); no screenshots

## 10. Documentation

- [x] 10.1 Update DESIGN.md (strings path `lib/i18n/uk.ts`, `WeatherIcon` and Lucide decided, the badge no-data variant now implemented) and AGENTS.md (Layout: `lib/location`, `lib/forecast`, `lib/scoring`, `lib/weekend`, `lib/geocode`, `app/_data`; fixture mode command); verify every path mentioned exists

## 11. End-to-end verification with live data

- [ ] 11.1 **[owner]** Start the app on your Mac with `npm run dev` (live Open-Meteo); then the agent runs the core loop in the built-in browser at `http://localhost:3000`: type «Льв», choose Львів with the keyboard, see the weekend panel and seven cards; confirm the network log shows only `localhost`, `document.cookie` is empty, the console is silent, and nothing visibly jumps when the forecast arrives
- [ ] 11.2 With live data, confirm assumptions A1–A3 (dates, nulls, Ukrainian names): a Ukrainian city, «Kraków», and a far-west place (e.g. Honolulu) show correct place-local dates; also open a shared URL, an invalid URL, and use Back/Forward
- [ ] 11.3 Final checks: CI green on the PR; `openspec validate weather-core --strict` passes

## Dropped from this change (decided 2026-11-25, see design.md "Decisions made during apply")

- Screenshots and a recording attached to the PR; the checks themselves stay in 9.4 and 11.1.
- A separate visual task for `/design-system` (internal page); folded into 9.4.
- Measuring `npm run verify` time in CI, client JS size, and CLS with a tool; a visual check of layout shift stays in 11.1.

## Workflow follow-up

- After merge: set the PRD rows listed in the proposal's Impact to `shipped` with a change-log line; `openspec archive weather-core`; verify `openspec list --specs` shows the six new capabilities.
- Vercel: do the `connect-vercel` change whenever a public URL is needed (demo video).
- Next changes: `weather-extras` (hourly chart, map with reverse geocoding, "Use my location", animated sky, clock, jokes) and `weekend-compare` (with FR-COMPARE-05).
