# CitySearch

The hero's centered combobox: free-form city input, debounced Open-Meteo geocoding suggestions, and the opt-in «Використати моє місцезнаходження» button beneath.

- Consumer provides: the query value, up to ~8 suggestions (`name`, `admin1`, `country`, optional flag), the active index, and handlers for select and for the location button.
- Structure: `wx-search` › `wx-field` (search icon + `wx-input`, 52px tall, `line-strong` border) › `wx-list` of `wx-option` rows (`b` = city, `small` = «область · країна» in `ink-muted`). Active row: `aria-selected="true"`, `brand-soft` ground.
- Behaviour: debounce ~250 ms; Arrow keys move the active row; Enter on a lone suggestion selects it; Escape closes the list. Selecting writes `?lat=&lon=&name=` to the URL.
- No match → render a `Notice` («Нічого не знайдено») in place of the list. Never a toast, never an error page.
- The flag is the product's only emoji; omit it when the platform renders flags as letters.
- Geolocation is read only when the button is pressed. No default city.
- The list sits at `z-popover` with `shadow-pop` so it floats above the map.
