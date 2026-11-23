Weather Explorer helps one anonymous visitor decide whether a weekend trip is worth it. The interface is one calm screen: a place, seven days, a comfort read per day, the weekend answered first. Ukrainian-first, practical, quiet. Nothing shouts — not the copy, not the colour, not the motion.

## Content fundamentals

- **Ukrainian first.** Every UI string is written in Ukrainian and kept in one strings module; English labels are a secondary locale, nothing more.
- **No exclamation marks, anywhere.** Not in empty states, not in jokes, not in errors. Calm full stops.
- **Practical and plain.** Translate numbers into how a day feels: «Тепло й сухо, легкий вітер. Гарний день для прогулянки.» One short sentence per comfort explanation.
- **Address the visitor with «ви»** in instructions («Оберіть місто»), but prefer impersonal phrasing where it reads naturally («Нічого не знайдено»).
- **Sentence case** for buttons and headings: «Використати моє місцезнаходження», «Порівняти вихідні».
- **Numbers carry units**: `18°` (Celsius is the only unit; the ° alone is enough after the first mention), `40%`, `12 км/год`, `UV 6`. Times are 24-hour: `06:42`.
- **Failures are calm and specific.** Say what happened and what still works: «Не вдалося завантажити прогноз. Карта й пошук працюють — спробуйте ще раз за хвилину.» Never a generic error page, never a toast for an empty search.
- **No emoji**, with one exception: the optional country flag in a search suggestion. Weather glyphs are icons, not emoji.
- Reference copy:
  - Hero: «Куди поїхати на вихідні»
  - Search placeholder: «Місто або село»
  - Empty result: «Нічого не знайдено»
  - Weekend panel title: «Ці вихідні»
  - Credits: «Дані: Open-Meteo · Карта: © OpenStreetMap contributors»

## Visual foundations

### Colour

- The page is paper and lake water: `surface` / `surface-raised` grounds, `ink` text, one hue — `brand` (lake teal) — for action and data.
- `accent` (weekend sun) belongs to the weekend only: the WeekendHighlight panel (`accent-soft` ground, `accent-ink` label) and the top rule of Saturday and Sunday day cards. Do not use it for anything else.
- Text pairs: `ink` and `ink-muted` on any surface; `ink-subtle` on `surface` and `surface-raised` only; `brand` text on `surface`, `surface-raised`, `brand-soft`. Text on fills uses the matching `on-…` token, never literal white.
- **Comfort** uses exactly three fills: `comfort-good` (70–100), `comfort-fair` (40–69), `comfort-poor` (0–39), each with its `on-comfort-…` text. The badge always shows the number **and** the word («Комфортно», «Терпимо», «Некомфортно») — colour is never the only signal. Good and poor are separated by lightness (≥3.4:1) as well as hue, so they stay distinct for colour-blind visitors.
- `danger` is for the text and icon of a failed-request Notice. Never a red fill, never a banner.
- Two UI themes, `light` and `dark`, follow `prefers-color-scheme`; the header shows which is active.

### The sky

- The animated background uses the `sky-*` tokens and follows the **place's** sunrise and sunset, not the UI theme or the visitor's clock: clear day `sky-day-top` → `sky-day-bottom`; cloud, rain or snow `sky-overcast-top` → `sky-overcast-bottom`; night `sky-night-top` → `sky-night-bottom`. Particles: `sky-cloud`, `sky-rain`, `sky-snow`.
- Motion is slow and sparse: clouds drift across the viewport over 60–120 s; rain and snow use at most ~80 particles. Nothing flashes.
- `prefers-reduced-motion: reduce` → the same gradient, static, no particles.
- The sky layer sits at `z-sky` with `pointer-events: none`. Content sits at `z-content`.
- **No text on the sky.** Reading text always sits on `surface-raised` cards; the header and the hero heading sit on a `scrim` panel.

### Type

- One family, Golos Text (`--font-sans`), drawn for Cyrillic; IBM Plex Mono (`--font-mono`) only for the live clock (`clock`) and small figures (`data`), so digits stay tabular.
- Scale: `display` (hero, once), `temp-xl` (weekend temperature), `title`, `heading`, `body`, `body-sm`, `label`, `caption`.
- Hi/lo reads `18° / 9°`: hi in `ink`, lo in `ink-muted`.
- Fonts are loaded from Google Fonts in these previews only. In the product, self-host both families (both are OFL) so the app makes no third-party font request — a privacy requirement.

### Space, shape, depth

- 4px grid: `space-1` … `space-16`. Cards pad `space-4` on mobile, `space-6` on desktop. Sections stack `space-6` / `space-8` apart.
- Corners: `radius-sm` badges and rows, `radius-md` controls and day cards, `radius-lg` section cards and the map, `radius-pill` chips.
- Cards are `surface-raised`, a 1px `line` outline and `shadow-card` — the shadow separates them from the moving sky. Popovers (suggestions, map popup) use `shadow-pop`.
- Borders that bound a control use `line-strong`; `line` is decoration only.

### Layout

- Mobile first. One column below 720px: header, hero/search, WeekendHighlight, 7 day cards in a horizontal scroll-snap row, hourly chart, map, compare, footer.
- From 1024px: a 12-column grid, max width 1200px. Weekend and day cards span the full width; the hourly chart (7 cols) sits beside the map (5 cols).
- The map is client-only; during SSR render a `surface-sunken` skeleton of exactly the map's footprint so nothing shifts.

### States

- Hover: `brand-soft` ground on rows and day cards. Pressed: one step darker via the component, not opacity.
- Focus: 2px solid `focus` outline, 2px offset, on every interactive element, including the map and day cards.
- Loading: `surface-sunken` skeletons of the final shape; no spinners longer than a moment.
- Disabled: 50% opacity text, `line` border, no pointer.

## Iconography

- Weather condition icons: a single-weight outline set at 24px (1.75px stroke), drawn with `currentColor` so they take `ink` or `on-…` colours. Map WMO weather codes to ~12 glyphs: clear, partly cloudy, cloudy, fog, drizzle, rain, heavy rain, snow, sleet, thunder, and night variants of clear and partly cloudy.
- No icon set ships with this system yet — choose an open set (e.g. Lucide's weather icons) and add it under `assets/Icons/`.
- Every icon next to a number has a text alternative in Ukrainian (`aria-label="Дощ"`).
- No logo is defined: the product name is set in `heading` type in `ink` in the header.

## Components

- **Button** — primary (`brand`) at most once per view; quiet elsewhere.
- **CitySearch** — the centered hero search with debounced suggestions and the opt-in location button.
- **ComfortBadge** — score plus word on a comfort fill.
- **DayCard** — one of the seven days.
- **WeekendHighlight** — the headline answer, above the grid.
- **CompareTable** — up to three pinned cities, weekend side by side.
- **Notice** — the calm inline state for empty results and failed requests.

Components are plain HTML with the `wx-` classes in `components/bundle.css`; `components/bundle.js` exposes `window.WeatherExplorer` with the comfort helpers every view shares.
