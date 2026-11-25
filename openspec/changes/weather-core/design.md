# Design

## Context

See `proposal.md` (Why). State that shapes the approach:

- **Framework:** Next.js 16.4 with **Cache Components on** (`cacheComponents: true`, `partialPrefetching: true`). Per its bundled docs: request-time data such as `searchParams` must be read inside a `<Suspense>` boundary, and data can be cached with `"use cache"` + `cacheLife`, where function arguments become the cache key.
- **Quality gates** (`openspec/specs/quality-gates`): `lib/` must be framework-free (no React, Next.js or browser globals; lint plus a DOM-less test runtime), Vitest covers `lib/` only, Fallow fails on dead code, and `npm run verify` must stay under 60 s.
- **Existing pieces:** design-system components (`DayCard`, `ComfortBadge`, `WeekendHighlight`, `Notice`, `Button`), the `wx-` CSS, `lib/format.ts` (place-local date formatting, tested), `lib/comfort.ts` (bands), `lib/strings.ts`.
- **Open-Meteo, verified against its docs:**
  - **Forecast:** `/v1/forecast` with `timezone=auto`, `forecast_days` up to 16. Defaults are °C and km/h. Errors return HTTP 400 `{ error: true, reason }`.
  - **Geocoding:** `/v1/search?name=&count=&language=`. A search with no match returns no `results` key at all (checked live). Queries under 2 characters return nothing.
- **Network constraint:** the agent's work VM and sandbox can't reach Open-Meteo (proxy 403), while the owner's Mac and Vercel can. Agent-side verification therefore needs fixtures, and the live checks run on a preview.

## Goals / Non-Goals

**Goals:**
- Keep all logic that decides what the user sees in `lib/` as pure functions, so it's unit-tested against the PRD tables: location parsing, normalising Open-Meteo responses, WMO mapping, comfort model, weekend selection, verdict.
- Keep framework code thin: fetching and caching, the page, and a few client components.
- Give a shared URL a static shell on first paint and stream the forecast in.

**Non-Goals:**
- Component or browser tests in Vitest (TC-STACK-05). UI behaviour is verified with a browser recording of the app running locally with live data on the owner's Mac.
- Error tracking or logging services (BC-PRIVACY-01).
- Persisting anything client-side (BC-PRIVACY-03).

## Decisions

### D-1 · Module layout: pure `lib/`, thin framework layer
```
lib/i18n/{uk,en,index}.ts       strings (uk is canonical; en: same keys, type-checked)
lib/location/                   parse/validate URL params, round, coordinate label
lib/forecast/{types,normalize,wmo}.ts   domain model, Open-Meteo JSON → model, WMO → {icon key, label}
lib/geocode/results.ts          Open-Meteo search JSON → suggestions (results absent → [])
lib/scoring/comfort.ts          Appendix A model (+ bands moved here from lib/comfort.ts)
lib/weekend/                    upcoming weekend, weekend summary and verdict band
app/_data/open-meteo.ts         server-only fetchers with "use cache"
app/api/geocode/route.ts        GET ?q= → suggestions JSON
app/page.tsx + app/_components/ page composition, CitySearch, ThemeIndicator (client)
```
- *Why:* everything testable sits behind the TC-PURE-01 lint wall. `next/cache`, `fetch` timeouts and React stay outside `lib/`.
- *WMO icons:* `lib/forecast/wmo.ts` returns an icon *key* (`"cloud-rain"`) and the label, and `components/design-system/WeatherIcon.tsx` maps keys to `lucide-react` components. This keeps `lib/` free of React.
- *Alternative:* one `lib/openMeteo.ts` that fetches and parses. Rejected, because fetching needs `next/cache` (framework), and splitting it lets the parser be tested without network.

### D-2 · Page composition with Cache Components
`app/page.tsx` renders a static shell: header, search, footer, plus a `<Suspense fallback={<ForecastSkeleton/>}>` around `<ForecastSection searchParams={…}>`. The hero sits above the search in its own `<Suspense fallback={null}>`, since it also depends on the URL (shown only without a location). `ForecastSection` awaits `searchParams` and parses them with `lib/location`:
- empty params → hero empty state
- invalid params → info Notice
- valid params → `await getForecast(lat, lon)` (cached), then normalise and render the weekend panel and seven `DayCard`s

The Suspense boundary is **not keyed** by location, so a transition keeps the old forecast on screen (FR-FORECAST-05). The hero heading shows only in the empty state. With a location, the search stays under the header and the place name is the `title` above the weekend panel.
- *Alternative:* `"use cache: private"` for the whole section. Rejected: caching the data function by `(lat, lon)` is simpler and shares entries across visitors.

### D-3 · Server data access and caching
`app/_data/open-meteo.ts`:
- **`getForecast(lat, lon)`** with `"use cache"` and `cacheLife({ stale: 300, revalidate: 900, expire: 3600 })`. It calls `/v1/forecast?latitude&longitude&timezone=auto&forecast_days=8` and requests:
  - `daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset`
  - `hourly=temperature_2m,cloud_cover`
  - `current=temperature_2m,weather_code,is_day,cloud_cover`

  It uses `AbortSignal.timeout(8000)` and throws on a non-2xx response or a shape error. Thrown results aren't cached, so the next request retries.
- **`searchPlaces(q)`** with `"use cache"` and `cacheLife({ revalidate: 86400 })`, calling `/v1/search?name=q&count=8&language=uk&format=json` with `AbortSignal.timeout(5000)`.
- **Keys:** `lat`/`lon` arrive already rounded to 2 decimals (D-4), so the cache key is the rounded location and NFR-API-01 holds.
- **Return values** are plain JSON-serialisable objects (a `use cache` constraint). `getForecast` returns the *normalised* model, so malformed input fails before anything is cached.
- *Alternative:* fetch from the browser. Rejected by TC-DATA-01, and it would leak visitor IPs to Open-Meteo.

### D-4 · URL handling (`lib/location`)
- **Parsing:** `parseLocation(params)` returns `{ kind: "empty" } | { kind: "invalid" } | { kind: "ok", lat, lon, name, label }`. It rounds half-up to 2 decimals on write, and trims and caps `name` to 80 characters.
- **Coordinate label:** `«49,84° пн. ш., 24,03° сх. д.»`, with a Ukrainian decimal comma and hemisphere words.
- **Writing the URL:** `CitySearch` calls `router.push(hrefFor(place), { scroll: false })` inside `startTransition`. Push gives the history entries FR-LOC-02 needs, and the transition keeps the old UI until the new one is ready.

### D-5 · City search client component
`app/_components/CitySearch.tsx` (`"use client"`) uses the existing `wx-search` markup:
- **Fetching:** a 250 ms debounce. An `AbortController` per query cancels stale requests, so out-of-order answers can't win.
- **Accessibility:** the ARIA 1.2 combobox pattern (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; listbox and option roles).
- **States:** empty results show the «Нічого не знайдено» Notice; failure or a 5 s timeout shows the error Notice; only for queries of 2 or more trimmed characters.
- **Flags:** computed from `country_code` as regional-indicator emoji, `aria-hidden`.

### D-6 · Strings and the English fallback
`uk.ts` exports `const uk = {...} as const`. `type Strings = Widen<typeof uk>` widens string literals to `string` and keeps function signatures, and `en.ts` is declared as `const en: Strings = {...}`. A missing or extra key is a type error. A unit test checks the copy rules (no «!», no emoji) over every string value, calling the string functions with sample arguments. `lib/strings.ts` is removed, and its imports point to `@/lib/i18n`.

### D-7 · Design-system changes
- `DayCard` takes `code` and renders `WeatherIcon`, as the original design-system API intended.
- `ComfortBadge` accepts `score: number | null`; `null` renders a `wx-badge-none` variant (`surface-sunken`, `ink-muted`, `line-strong` hairline), as DESIGN.md now specifies.
- `WeekendHighlight` stays presentational. The page passes a verdict title from `lib/weekend` + `uk` strings, and passes a `Notice` instead when there's no score.
- The 4 hand-drawn weather glyphs in `icons.tsx` are removed in favour of Lucide. The UI icons (search, location, info, alert) stay.

### D-8 · Theme indicator
`app/_components/ThemeIndicator.tsx` (`"use client"`) reads `document.documentElement.dataset.theme` through `useSyncExternalStore`, subscribing to the `prefers-color-scheme` media query. The server snapshot is `null` and renders nothing, which avoids a hydration mismatch. The client then renders «Світла тема» / «Темна тема» with a small sun or moon icon.

### D-9 · Fixture mode for agent-side verification
When `WEATHER_FIXTURES=1` **and** `NODE_ENV !== "production"`, `app/_data/open-meteo.ts` returns responses from `lib/forecast/__fixtures__/` and `lib/geocode/__fixtures__/` instead of fetching. The same JSON files feed the unit tests. This lets the agent run the app and check the UI despite the blocked network, and it can never activate in production.
- *Fixtures:* synthetic but schema-true, following the Open-Meteo docs: a normal week (Львів), a rainy week, a day with all comfort inputs `null`, a Sunday "today", a place 10 h behind UTC, and geocoding "Льв" plus "no results".
- *Alternative:* mock `fetch` only in tests. Rejected, because it doesn't help visual verification.

### D-10 · Live verification on the owner's machine (Vercel postponed)
The owner postponed Vercel to a separate `connect-vercel` change. Live end-to-end checks run on the owner's Mac instead: the owner starts `npm run dev`, which reaches Open-Meteo directly, and the agent drives the app's built-in browser at `http://localhost:3000`. Fixture mode stays for agent-side development.

### Decisions made during apply (2026-11-25)
- **D-11 · Leaner verification.** One browser pass in fixture mode (task 9.4) and one live pass (11.1–11.2) replace per-task browser checks. Dropped as low value for a demo: screenshots and a recording in the PR, a separate visual task for the internal `/design-system` page, and measuring CI time, client JS size and CLS with a tool. Unit tests, `npm run verify`, rendered-HTML checks in fixture mode and CI remain the evidence.
- **D-12 · Search failure answers HTTP 200.** `/api/geocode` returns `{ error: true }` with HTTP 200 and `Cache-Control: no-store` on upstream failure. A 4xx/5xx would be logged in the browser console, and FR-SEARCH-08 requires a silent console.
- **D-13 · "Today" comes from the clock, not the data.** `ForecastSection` works out the place's current date per request from the place's UTC offset (`lib/forecast/today.ts`) and starts the cards and the weekend from it, because a forecast cached before the place's midnight would otherwise show yesterday (CodeRabbit, PR #2). If the data doesn't cover that date (fixtures), the data's first day is used.
- **D-14 · Weekend accent by weekday.** Day cards are accented when they fall on a Saturday or Sunday, independent of which weekend the panel describes; on a Sunday, today's card is accented while the panel already covers next weekend (CodeRabbit, PR #2).
- **D-15 · Search shows only the current query.** Each keystroke clears the previous suggestions at once, so Enter can't pick a stale result; an answer that arrives after the field lost focus stays hidden until focus returns (CodeRabbit, PR #2).
- **D-16 · Review setup.** The PR description is free-form: the course homework template (author name, demo video, practices write-up) was replaced by a plain template, CodeRabbit's description check is off, and CodeRabbit reviews code and specs in English with per-area rules (`.coderabbit.yaml`). The repository gets no automatic CodeRabbit reviews (public, under 10 stars), so each review is requested with `@coderabbitai review`, once more before merge only if new code lands.

## Risks / Trade-offs

- **[`daily.time` format]** The docs don't show a daily example. The design assumes `YYYY-MM-DD` place-local dates. → The normaliser validates the format and fails to the error Notice. The first live check on the owner's Mac confirms the real shape, and if it differs only the normaliser changes.
- **[`use cache` and thrown errors]** The design relies on failed fetches not being cached. → Spec scenario "Failure is not cached", checked with live data by forcing one failure: an invalid but in-range location, or a temporarily wrong API host via fixture mode.
- **[Shared hosting IPs and the Open-Meteo per-IP limit, once deployed]** → Server caching (15 min per place, 24 h per query) keeps call volume tiny for a demo. Failures degrade to Notices.
- **[Combobox accessibility done by hand]** → The behaviour follows the ARIA 1.2 pattern, and the browser pass (task 9.4) covers keyboard-only use plus an accessibility-tree check of roles and states.
- **[Agent can't see live data]** → Fixture mode (D-9) for development; live checks on the owner's Mac (D-10).
- **[Bundle size]** `lucide-react` with named imports tree-shakes to the 12 icons. → Not measured in this change (D-11); named imports keep it to the 12 icons used.

## Migration Plan

1. Implement on `feat/weather-core` in task order, keeping `npm run verify` green after each group.
2. Verify end to end with live data on the owner's Mac, then merge. Mark the PRD rows shipped and archive the change.
3. **Rollback:** revert the merge commit. No data or schema is involved.

## Assumptions

| ID | Assumption | Checked by |
| --- | --- | --- |
| A1 | Open-Meteo `daily.time` values are `YYYY-MM-DD` in the place's time zone | Normaliser validation + first live run |
| A2 | Missing values arrive as `null` inside the arrays (not as absent arrays) | Normaliser treats both as missing; live run |
| A3 | `language=uk` returns Ukrainian names and regions for Ukrainian places and falls back to local names elsewhere | Live search for «Львів», «Kraków» (task 11.2) |
| A4 | The owner can run `npm run dev` on their Mac (Node 24, network access to Open-Meteo) for the live checks | Task 11.1 |
