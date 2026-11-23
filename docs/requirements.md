# PRD — Weather Explorer / Weekend Trip Planner

Last updated: 2026-11-23 (see [Change log](#change-log))

This document is the **single source of truth** for what the product does and
what constraints govern it. Every requirement has a stable ID. Specs, tests,
PRs, and recordings reference these IDs to keep traceability intact.

Refer to [docs/product-brief.md](product-brief.md) for narrative context.

## ID conventions

| Prefix   | Meaning                  | Example                                   |
| -------- | ------------------------ | ----------------------------------------- |
| `FR-*`   | Functional Requirement   | `FR-SEARCH-01` — user searches city by name |
| `NFR-*`  | Non-Functional Requirement | `NFR-PERF-01` — TTFB < 300 ms             |
| `TC-*`   | Technical Constraint     | `TC-STACK-01` — Next.js 16 App Router     |
| `BC-*`   | Business / UX Constraint | `BC-PRIVACY-01` — no analytics            |

Status values: `proposed` · `accepted` · `shipped` · `dropped`.

## Functional requirements

### Shell & navigation

| ID          | Description                                                                                           | Status     |
| ----------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| FR-SHELL-01 | Single-page app with a top bar (product name in `heading` type — no logo, per DESIGN.md — and a theme indicator) and a main content area | proposed |
| FR-SHELL-02 | Mobile-first layout per DESIGN.md: one column below 720 px; from 1024 px a 12-column grid, max width 1200 px (hourly chart 7 columns beside the map 5 columns) | proposed |
| FR-SHELL-03 | Empty state on first load: hero copy + city search prominently centered                               | proposed   |
| FR-SHELL-04 | The theme follows `prefers-color-scheme`; the header shows which theme is active. There is no toggle, so nothing is stored in the browser | proposed |

### Top clock (demo capability `top-clock`)

| ID          | Description                                                                                           | Status     |
| ----------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| FR-CLOCK-01 | Header shows a compact accessible local-time clock that updates live while the page is open           | proposed   |
| FR-CLOCK-02 | With an active location the clock shows **that place's** local time (`HH:mm`, 24-hour, place time zone from the forecast); with none it shows the visitor's local time. It updates every minute and renders on the client in a fixed-width slot, so there is no layout shift and no hydration warning | proposed |

### City search (capability `city-search`)

| ID           | Description                                                                                              | Status     |
| ------------ | -------------------------------------------------------------------------------------------------------- | ---------- |
| FR-SEARCH-01 | User types a free-form city name into a single input; debounced suggestions appear from Open-Meteo geocoding API | proposed   |
| FR-SEARCH-02 | Each suggestion shows: city name, admin region, country, optional flag emoji                             | proposed   |
| FR-SEARCH-03 | Selecting a suggestion sets the active location; URL reflects it as `?lat=&lon=&name=`                   | proposed   |
| FR-SEARCH-04 | Pressing Enter with a single suggestion auto-selects it                                                  | proposed   |
| FR-SEARCH-05 | If the geocoding API returns zero results, show «Нічого не знайдено» inline (Notice); no error toast | proposed |
| FR-SEARCH-06 | A «Використати моє місцезнаходження» button reads the browser geolocation only when pressed (BC-PRIVACY-02); the position becomes the active location, named as in FR-MAP-03 | proposed |
| FR-SEARCH-07 | If geolocation is denied, unavailable or takes longer than 10 s, show a calm inline Notice; search keeps working | proposed |

### Active location (capability `active-location`)

| ID        | Description | Status |
| --------- | ----------- | ------ |
| FR-LOC-01 | The active location lives only in the URL (`?lat=&lon=&name=`, Appendix C). Coordinates are written rounded to 2 decimals (≈1 km); `name` is at most 80 characters. Invalid params (non-numeric, out of range) show the empty state with an info Notice; a missing `name` shows a coordinates label | proposed |
| FR-LOC-02 | Choosing a new place (search, map click, geolocation, compare row) pushes a history entry, so Back returns to the previous place. Pin changes replace the current entry | proposed |

### Footer jokes (capability `bottom-jokes`)

| ID          | Description                                                                                 | Status   |
| ----------- | ------------------------------------------------------------------------------------------- | -------- |
| FR-JOKES-01 | Footer area shows deterministic Ukrainian weather-themed jokes without external APIs or tracking | proposed |
| FR-JOKES-02 | 14 short jokes live in the Ukrainian strings module. The joke shown is `dayOfYear mod 14` of the place's local date (the visitor's date with no active location), so the same day always shows the same joke. No exclamation marks | proposed |

### Forecast (capability `forecast`)

| ID             | Description                                                                                                | Status     |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| FR-FORECAST-01 | After a location is selected, fetch from the Open-Meteo forecast API (`timezone=auto`): 8 days of daily data (7 are shown; the 8th covers next Sunday, FR-COMFORT-06), hourly data, and current conditions | proposed |
| FR-FORECAST-02 | Render 7 day cards: weekday name, hi / lo °C, weather icon, precipitation probability %, wind speed        | proposed   |
| FR-FORECAST-03 | Render an hourly temperature line chart for the next 48 h using Recharts                                   | proposed   |
| FR-FORECAST-04 | Show sunrise + sunset for today as small text under the hourly chart                                       | proposed   |
| FR-FORECAST-05 | Re-fetch when the location changes. Responses are cached on the server per rounded location (forecast 15 min, geocoding 24 h). While a new place loads, the previous forecast stays visible instead of blanking | proposed |
| FR-FORECAST-06 | If the forecast request fails or times out (8 s), show an error Notice where the forecast would be («Не вдалося завантажити прогноз» + what still works); search and map keep working | proposed |
| FR-FORECAST-07 | While loading, show `surface-sunken` skeletons in the final shape; no spinners, no layout shift | proposed |
| FR-FORECAST-08 | Each WMO weather code maps to one of 12 Lucide glyphs with a Ukrainian `aria-label` (Appendix B) | proposed |

### Map (capability `map`)

| ID        | Description                                                                                                  | Status     |
| --------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| FR-MAP-01 | Render an OSM-tiled interactive map (Leaflet via react-leaflet) bounded to the current location              | proposed   |
| FR-MAP-02 | Show a marker at the current location with a popup naming the city                                           | proposed   |
| FR-MAP-03 | Clicking on the map makes the point the active location and re-fetches the forecast; the place name comes from reverse geocoding via OSM Nominatim through a server route (TC-GEO-01), and falls back to a coordinates label when that is unavailable | proposed |
| FR-MAP-04 | Display "© OpenStreetMap contributors" attribution at the bottom-right; required by OSM Tile Usage Policy    | proposed   |
| FR-MAP-05 | Map is client-only (`dynamic({ ssr: false })`); SSR placeholder is a skeleton with the same footprint        | proposed   |

### Comfort score (capability `comfort-score`)

| ID            | Description                                                                                                              | Status     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------- |
| FR-COMFORT-01 | `comfortScore(daily): { value: 0..100; rationale: string }` is a **pure function** in `lib/scoring/comfort.ts`            | proposed   |
| FR-COMFORT-02 | Inputs per day: apparent temperature max, precipitation probability max, wind speed max, mean cloud cover 09:00–18:00 place time (from hourly `cloud_cover`), UV index max | proposed |
| FR-COMFORT-03 | Output rationale is a single sentence in Ukrainian, max 80 chars, no emojis                                              | proposed   |
| FR-COMFORT-04 | Score for each day is displayed in the day card as a ComfortBadge: number and word on the good (≥ 70), fair (40–69) or poor (< 40) fill from DESIGN.md; colour is never the only signal | proposed |
| FR-COMFORT-05 | Score for the upcoming weekend (Sat + Sun avg) is highlighted at the top of the forecast grid                            | proposed   |
| FR-COMFORT-06 | "Upcoming weekend" by the place's local date: Monday–Saturday → this week's Saturday + Sunday (on Saturday, today and tomorrow); Sunday → next week's Saturday + Sunday | proposed |
| FR-COMFORT-07 | The score and rationale follow the model in Appendix A; its reference cases are acceptance tests | proposed |
| FR-COMFORT-08 | The weekend verdict follows the weekend score's band: ≥ 70 «‹місто› — варто їхати», 40–69 «‹місто› — можна їхати, але з планом Б», < 40 «‹місто› — краще перенести» | proposed |

### Animated background (capability `animated-bg`)

| ID         | Description                                                                                                                          | Status     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| FR-ANIM-01 | Background reflects current condition: day / night gradient, rain particles, snow particles, cloud drift                            | proposed   |
| FR-ANIM-02 | Daytime vs nighttime is driven by today's sunrise/sunset for the active location, not by user's clock                                | proposed   |
| FR-ANIM-03 | Animations respect `prefers-reduced-motion`: when set, render static gradient only                                                   | proposed   |
| FR-ANIM-04 | Background never blocks interaction; pointer-events disabled                                                                         | proposed   |

### Weekend compare (capability `weekend-compare`, MVP — promoted at Checkpoint 1)

| ID            | Description                                                                                                                                                          | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| FR-COMPARE-01 | User can pin up to 3 cities; pinned cities appear in a small chip row above the forecast                                                                             | proposed   |
| FR-COMPARE-02 | A «Порівняти вихідні» toggle switches the view to a comparison table with one row per pinned city, sorted by weekend comfort (best first): Saturday and Sunday hi/lo and precipitation %, weekend comfort score; the best row is marked «Найкращий вибір». Below 720 px the table scrolls horizontally | proposed |
| FR-COMPARE-03 | Each row names its city; activating the row (click or keyboard) makes that city the active location | proposed |
| FR-COMPARE-04 | Pinned cities live only in the URL as repeated `pin=<lat>,<lon>,<name>` params (max 3; Appendix C), so a comparison is shareable and nothing is stored in the browser | proposed |

## Non-functional requirements

| ID            | Description                                                                                                            | Status     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| NFR-PERF-01   | Vercel Preview TTFB ≤ 300 ms on p95 for the homepage                                                                   | proposed   |
| NFR-PERF-02   | Lighthouse Performance ≥ 90 on production URL (mobile + desktop)                                                       | proposed   |
| NFR-PERF-03   | Initial client JS payload ≤ 200 KB gzipped                                                                             | proposed   |
| NFR-A11Y-01   | Lighthouse Accessibility ≥ 95; all interactive elements have visible focus styles and accessible names                | proposed   |
| NFR-A11Y-02   | Color palette meets WCAG AA contrast ratio across both light and dark themes                                          | proposed   |
| NFR-COST-01   | Zero paid API keys; all third-party data is keyless or free-tier                                                       | proposed   |
| NFR-OBS-01    | Console is silent at runtime (no warnings, no errors) on a healthy session                                             | proposed   |
| NFR-DX-01     | `npm run lint && tsc --noEmit && npm test && npm run build` finish in < 60 s on a clean checkout                       | proposed   |
| NFR-I18N-01 | Product UI strings centralised in `lib/i18n/uk.ts`; `lib/i18n/en.ts` has the same keys (type-checked) as the English fallback. The locale is fixed to `uk`; no runtime i18n library and no language switch in MVP | proposed |
| NFR-API-01 | Stay within the Open-Meteo free tier (non-commercial; < 10,000 calls/day, < 5,000/hour, < 600/min) through the server caches in FR-FORECAST-05; credit Open-Meteo (CC BY 4.0) in the footer | proposed |

## Technical constraints

| ID            | Description                                                                                                                            | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| TC-STACK-01 | Next.js 16 App Router (16.4.x); TypeScript strict; React 19 (19.3.x) | accepted |
| TC-STACK-02 | Tailwind CSS 4 (via the `@tailwindcss/turbopack` loader) mapped to the design-system tokens; UI components are the design-system components in `components/design-system` (`wx-` classes); no shadcn/ui or class-variance-authority | accepted |
| TC-STACK-03 | Open-Meteo APIs (forecast + forward geocoding); no other weather provider. Reverse geocoding, which Open-Meteo does not offer, uses OSM Nominatim under TC-GEO-01 | accepted |
| TC-STACK-04   | Leaflet + react-leaflet for maps; OSM raster tiles only                                                                                | accepted   |
| TC-STACK-05 | Vitest for unit tests on `lib/`; no Playwright — end-to-end evidence is a `chrome-devtools` MCP recording per milestone | accepted |
| TC-STACK-06 | Weather icons from `lucide-react` (tree-shaken, stroke width 1.75, `currentColor`) | proposed |
| TC-DEPLOY-01  | Vercel for hosting; preview URL per PR via Git integration                                                                             | proposed   |
| TC-DATA-01    | All Open-Meteo calls happen from Server Components or Route Handlers when possible; never expose Open-Meteo URLs in the client bundle in a way that suggests they require keys | proposed   |
| TC-MAP-01     | OSM tiles include attribution; respect Tile Usage Policy (HTTPS, no scraping, valid Referer)                                          | proposed   |
| TC-GEO-01 | Nominatim (reverse geocoding only, never search autocomplete) is called from a Route Handler, never the browser; app-wide ≤ 1 request/s; identifying User-Agent; responses cached; OSM attribution shown; an environment switch turns it off without a code change (coordinates label fallback) — per the [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/) | proposed |
| TC-PURE-01    | `lib/` is framework-free: no `next/*`, no `react`, no DOM globals — enables 100% unit-testability                                       | proposed   |

## Business / UX constraints

| ID             | Description                                                                                                          | Status     |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| BC-PRIVACY-01  | No analytics, no third-party trackers, no fingerprinting                                                             | accepted   |
| BC-PRIVACY-02  | Geolocation only via explicit user action (button "Use my location") — never on page load                            | accepted   |
| BC-PRIVACY-03  | No cookies set by the application code                                                                               | accepted   |
| BC-BRAND-01    | Visual identity follows DESIGN.md (chosen in Phase 4). UI is Ukrainian-first; tone is calm, practical, no exclamation marks | proposed   |
| BC-BRAND-02    | Footer credits Open-Meteo and OpenStreetMap with hyperlinks                                                          | proposed   |
| BC-BRAND-03 | Units and formats: °C only, wind in km/h, probabilities in %, 24-hour time, dates as the place's local calendar dates | proposed |
| BC-DEMO-01     | The repo and live URL are the workshop's primary artifacts; every requirement is publicly demonstrable               | accepted   |

## Out of scope (MVP)

- Push notifications, scheduled jobs, background data refresh
- User accounts, history, favorites persisted server-side
- Marine / aviation / agriculture weather variables
- Localisation beyond UA + EN labels
- Native mobile app
- Climate / historical analysis beyond 7-day forecast

## Appendix A — Comfort scoring model (FR-COMFORT-01/02/07)

`comfortScore(day) = clamp(0, 100, roundHalfUp(100 − Σ penalties))`

| Factor | Open-Meteo source | Penalty | Cap |
| --- | --- | --- | --- |
| Cold | daily `apparent_temperature_max` (T) | 2.5 × (18 − T) when T < 18 | 45 |
| Heat | daily `apparent_temperature_max` (T) | 4 × (T − 24) when T > 24 | 45 |
| Rain | daily `precipitation_probability_max` (P, %) | 0.6 × P | 60 |
| Wind | daily `wind_speed_10m_max` (W, km/h) | 1 × (W − 15) when W > 15 | 25 |
| Cloud | mean hourly `cloud_cover` 09:00–18:00 (C, %) | 0.1 × C | 10 |
| UV | daily `uv_index_max` (U) | 3 × (U − 5) when U > 5 | 15 |

Missing inputs count as zero penalty; the function is total and never throws.

**Rationale:** if Σ penalties < 20 the day is "ideal". Otherwise the factor with the largest penalty decides, with "strong" wording when that penalty is ≥ 20 (ties: the order of the table). Each line is one sentence of ≤ 80 characters:

| Key | Rationale |
| --- | --- |
| ideal | Комфортна погода — гарний день для прогулянки. |
| cold | Прохолодно, тож візьміть теплу куртку. |
| cold, strong | Холодно — для прогулянок знадобиться зимовий одяг. |
| heat | Тепло, а в найспекотніші години краще шукати тінь. |
| heat, strong | Спекотно — плануйте прогулянки на ранок і вечір. |
| rain | Можливий дощ, тож візьміть парасолю. |
| rain, strong | Ймовірно, дощитиме більшу частину дня. |
| wind | Відчутний вітер, на відкритих місцях буде прохолодніше. |
| wind, strong | Сильний вітер — краще уникати відкритих місць. |
| cloud | Похмуро, але сухо й спокійно. |
| uv | Сонце активне — знадобляться капелюх і крем від сонця. |

**Weekend score:** `roundHalfUp((saturday + sunday) / 2)`; the weekend rationale is Saturday's or Sunday's, whichever scored lower.

**Reference cases** (acceptance tests for FR-COMFORT-07):

| Case | T °C | P % | W km/h | C % | UV | Score | Band | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ідеальний травневий день | 21 | 5 | 8 | 30 | 5 | 94 | good | ideal |
| Тепло, мінлива хмарність | 25 | 10 | 12 | 50 | 6 | 82 | good | ideal |
| Хмарно й тихо | 20 | 10 | 8 | 100 | 3 | 84 | good | ideal |
| Прохолодно й сухо | 12 | 10 | 10 | 60 | 2 | 73 | good | cold |
| Вітряно, але сухо | 19 | 10 | 40 | 40 | 4 | 65 | fair | wind, strong |
| Листопад, похмуро | 5 | 20 | 14 | 90 | 1 | 47 | fair | cold, strong |
| Зимовий сонячний день | −3 | 0 | 10 | 10 | 1 | 54 | fair | cold, strong |
| Літня спека | 33 | 5 | 10 | 10 | 9 | 48 | fair | heat, strong |
| Дощовий день | 16 | 90 | 20 | 100 | 2 | 26 | poor | rain, strong |
| Злива з вітром | 14 | 100 | 45 | 100 | 1 | 0 | poor | rain, strong |

## Appendix B — Weather icon mapping (FR-FORECAST-08)

| WMO codes | Condition (aria-label) | Lucide icon (day / night) |
| --- | --- | --- |
| 0 | Ясно | `sun` / `moon` |
| 1, 2 | Мінлива хмарність | `cloud-sun` / `cloud-moon` |
| 3 | Хмарно | `cloud` |
| 45, 48 | Туман | `cloud-fog` |
| 51, 53, 55 | Мряка | `cloud-drizzle` |
| 61, 63, 80, 81 | Дощ | `cloud-rain` |
| 65, 82 | Сильний дощ | `cloud-rain-wind` |
| 56, 57, 66, 67 | Мокрий сніг | `cloud-hail` |
| 71, 73, 75, 77, 85, 86 | Сніг | `cloud-snow` |
| 95, 96, 99 | Гроза | `cloud-lightning` |
| unknown | Невідомо | `cloud` |

Day cards always use the day variant; night variants are for current conditions only.

## Appendix C — URL schema (FR-LOC-01/02, FR-COMPARE-04)

```
/?lat=49.84&lon=24.03&name=Львів&pin=48.62,22.30,Ужгород&pin=48.29,25.94,Чернівці&view=compare
```

| Param | Meaning | Rules |
| --- | --- | --- |
| `lat`, `lon` | Active location | Decimal degrees, 2 decimals, lat −90…90, lon −180…180 |
| `name` | Display name of the active location | URL-encoded, ≤ 80 chars; optional (coordinates label otherwise) |
| `pin` | A pinned city, repeated up to 3 times | `<lat>,<lon>,<name>`; the name is everything after the second comma |
| `view` | `compare` shows the comparison table | Absent = forecast view |

## Change log

### 2026-11-23 — contradictions resolved

From the capability analysis (`docs/capabilities.md` §6). Where a choice was needed, the roadmap's recommendation was applied; decision IDs refer to `docs/implementation-roadmap.md`.

| Item | Change | Why |
| --- | --- | --- |
| FR-SHELL-01 | "logo" → product name in `heading` type, no logo | DESIGN.md defines no logo (BC-BRAND-01) |
| FR-SHELL-02 | 768 / 1280 px, 1/2/3 columns → 720 / 1024 px, 1 column → 12-column grid, max 1200 px | D2: BC-BRAND-01 defers visual identity to DESIGN.md |
| FR-SEARCH-05 | "Nothing found" → «Нічого не знайдено» | Ukrainian-first copy (BC-BRAND-01) |
| FR-SEARCH-06 | Added | Cited by the product brief and BC-PRIVACY-02 but missing here |
| FR-MAP-03, TC-STACK-03, TC-GEO-01 | Reverse geocoding via OSM Nominatim (server-side, under its usage policy) with a coordinates fallback | D1: Open-Meteo geocoding only searches by name or id — no reverse lookup |
| FR-COMFORT-04 | green / yellow / red → good / fair / poor fills with number and word | The design system's poor fill is salmon/brick, and colour is never the only signal |
| FR-COMPARE-* | No longer "optional"; rows per city sorted best first instead of columns with sticky headers | Brief: promoted to MVP at Checkpoint 1. D3: matches the specified `CompareTable` and works on mobile |
| TC-STACK-01 | 16.2 / 19.2 → 16.4.x / 19.3.x | Matches the installed toolchain |
| TC-STACK-02 | PostCSS plugin, shadcn/ui, cva → `@tailwindcss/turbopack`, design-system components | D9: the repo uses the turbopack loader; the design system already supplies the components |

### 2026-11-23 — open decisions resolved (demo-scale choices)

| Decision | Choice | Requirements |
| --- | --- | --- |
| D4 Which weekend | Mon–Sat → this weekend; Sunday → next weekend; fetch 8 days | FR-COMFORT-06, FR-FORECAST-01 |
| D5 Clock time zone | Place time when a location is active, else the visitor's | FR-CLOCK-02 |
| D6 Comfort formula | Capped penalties per factor, templated rationale, 10 reference cases | FR-COMFORT-07, FR-COMFORT-08, Appendix A |
| D7 Pin storage | URL only (`pin=` repeated) | FR-COMPARE-04, Appendix C |
| D8 Caching | Server cache per rounded location (15 min forecast, 24 h geocoding); keep the old forecast visible while loading | FR-FORECAST-05 |
| D10 English | Type-checked `en.ts` fallback, locale fixed to `uk` | NFR-I18N-01 |
| D11 Jokes | 14 jokes, `dayOfYear mod 14` by place-local date | FR-JOKES-02 |
| D12 Icon set | `lucide-react`, 12 glyphs | FR-FORECAST-08, TC-STACK-06, Appendix B |
| D13 Daily cloud cover | Mean of hourly `cloud_cover` 09:00–18:00 | FR-COMFORT-02 |
| D14 URL precision | 2 decimals | FR-LOC-01 |
| D15 E2E verification | Vitest + chrome-devtools MCP recordings; no Playwright | TC-STACK-05 (accepted) |
| D16 Open-Meteo terms | Non-commercial demo fits the free tier; caching keeps calls low; CC BY 4.0 credit | NFR-API-01 |

Also added from the gap analysis: FR-SHELL-04, FR-SEARCH-07, FR-LOC-01/02, FR-FORECAST-06/07, BC-BRAND-03.
