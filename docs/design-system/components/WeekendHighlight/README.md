# WeekendHighlight

The headline answer above the seven-day grid: is the upcoming weekend worth going for, at this place.

- Consumer provides: place name, Saturday + Sunday local dates, averaged comfort score, combined hi/lo, the per-day hi/lo and precipitation, and the one-sentence Ukrainian explanation.
- Structure: `wx-weekend` panel on `accent-soft`, `radius-lg`, `space-6` padding. Label «Ці вихідні · dates» in `accent-ink` with a small `accent` disc; title in `title` type phrased as a verdict («Львів — варто їхати», «Львів — краще перенести»); explanation in `ink-muted`; `temp-xl` temperature and a `lg` ComfortBadge on the right; per-day line below.
- Exactly one per page, always above the day cards. If the weekend falls outside the 7-day window, say so plainly instead of hiding the panel.
