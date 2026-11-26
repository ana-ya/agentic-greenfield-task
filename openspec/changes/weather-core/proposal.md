# Proposal

## Why

The repository has a verified engineering foundation but no product: the home page is a placeholder. This change delivers the smallest end-to-end version of Weather Explorer that answers the product's question, «чи варто їхати на ці вихідні». Search a place, see its seven days with a comfort read per day, and get the weekend verdict first. It merges roadmap M0 (rest), M1 and M2 into one change, as the owner asked for fewer, larger changes.

## What Changes

- **App shell:** header with the product name and a theme indicator, a first-load hero with centred search and no default city, and a footer with linked Open-Meteo / OpenStreetMap credits. The layout follows DESIGN.md (one column below 720 px; 12-column grid from 1024 px, max 1200 px), with slots for later features.
- **Strings:** move `lib/strings.ts` to `lib/i18n/uk.ts`, with a type-checked `lib/i18n/en.ts` fallback (NFR-I18N-01).
- **Active location in the URL:** `?lat=&lon=&name=` is the single source of truth. Coordinates are rounded to 2 decimals, invalid params get a calm Notice, and Back/Forward move between places.
- **City search:** debounced suggestions from Open-Meteo geocoding through a server route. Accessible combobox (arrow keys, Enter, Escape), Enter on a lone suggestion selects it, and «Нічого не знайдено» shows inline.
- **Forecast:** server-side Open-Meteo fetch (`timezone=auto`, 8 days of daily data, hourly `temperature_2m` + `cloud_cover`, current conditions), normalised into a framework-free domain model and cached per rounded location. Seven `DayCard`s with Lucide weather icons mapped from WMO codes. Skeletons while loading, a calm Notice on failure, and the previous forecast stays visible while a new place loads.
- **Comfort score:** a pure, total function implementing PRD Appendix A, including the «Немає даних» rule, with every reference case as a test. A badge on each day card.
- **Weekend verdict:** the upcoming weekend by place-local date (Sunday means next weekend), averaged score, verdict title by band, rationale, shown above the day cards; a Notice when there's no score.
- **New runtime dependency:** `lucide-react` (TC-STACK-06).

**Not in this change:** deployment to Vercel (postponed by the owner to `connect-vercel`), hourly chart and sunrise/sunset (FR-FORECAST-03/04), map (FR-MAP-*), "Use my location" (FR-SEARCH-06/07, needs reverse geocoding), animated background, clock, jokes, weekend compare. These belong to the next changes (`weather-extras`, `weekend-compare`).

## Capabilities

### New Capabilities
- `app-shell`: the page frame (header, hero, layout grid, footer credits), theme indication, and centralised Ukrainian-first UI strings.
- `active-location`: the URL as the single source of truth for the selected place: format, validation, precision, history behaviour.
- `city-search`: finding a place by name: suggestions, keyboard model, selection, empty and failure states.
- `forecast`: getting a place's forecast and showing its seven days: data scope, caching, day cards, icons, loading and failure states.
- `comfort-score`: turning a day's weather into a 0–100 comfort score with a one-sentence Ukrainian rationale, or "no data".
- `weekend-highlight`: choosing the upcoming weekend for a place and presenting the weekend verdict.

### Modified Capabilities
None. `quality-gates` stays as is; this change must pass it.

## Impact

- **New code:** `app/page.tsx` (rebuilt), `app/api/geocode/route.ts`, `lib/i18n/{uk,en}.ts`, `lib/location/`, `lib/forecast/` (types, normaliser, WMO mapping), `lib/scoring/comfort.ts`, `lib/weekend/`, client components for search and URL navigation, plus tests and fixtures.
- **Changed:** `components/design-system/DayCard.tsx` (takes a WMO code), `ComfortBadge.tsx` (no-data variant), `WeekendHighlight.tsx` (verdict bands); `lib/comfort.ts` folds into `lib/scoring/`; `lib/strings.ts` → `lib/i18n/uk.ts`; DESIGN.md and AGENTS.md references.
- **Dependencies:** `lucide-react` (runtime).
- **External:** Open-Meteo forecast + geocoding APIs (keyless, free tier, called only from the server). Vercel is postponed to the separate `connect-vercel` change.
- **Requirements:** FR-SHELL-01–04, FR-SEARCH-01–05, FR-LOC-01/02, FR-FORECAST-01/02/05–08, FR-COMFORT-01–09, NFR-I18N-01, NFR-API-01, NFR-COST-01, TC-DATA-01, TC-STACK-03/06, BC-BRAND-01–03, BC-PRIVACY-01–03. NFR-A11Y-01/02 and NFR-OBS-01 are to be verified with live data on the owner's machine (tasks 11.1–11.3); not done yet.
