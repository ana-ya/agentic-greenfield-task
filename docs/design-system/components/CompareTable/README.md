# CompareTable

Side-by-side weekend comparison of up to three pinned cities.

- Consumer provides: 1–3 cities, each with Saturday and Sunday hi/lo and precipitation probability, and the weekend comfort score; the best city is marked with `wx-best`.
- Structure: pinned cities as `wx-chip` pills above (`brand-soft`; a dashed `wx-chip-empty` shows the remaining slots or «Закріплено 3 з 3»), then `wx-compare` table on `surface-raised`, header row on `surface-sunken`. Figures in `data` mono.
- Sort rows by comfort, best first. The best row carries «Найкращий вибір» in `accent-ink` — the weekend accent, because this is the weekend answer.
- Clicking a city row makes it the active location.
- Below 720px, keep the table and let it scroll horizontally; do not turn rows into cards.
