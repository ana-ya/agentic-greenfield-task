# DayCard

One of the seven daily forecast cards: weekday and date, condition icon, hi/lo, precipitation probability, wind, comfort badge.

- Consumer provides: local date (of the place, not the visitor), `hi`, `lo` in °C, WMO weather code → icon with a Ukrainian `aria-label`, precipitation probability (%), wind (km/h), comfort score, and `weekend` for Saturday and Sunday.
- Structure: `wx-day` (`surface-raised`, `radius-md`, `shadow-card`, 3px top rule) › `wx-day-name` (`label`) › 28px icon › `wx-hilo` (hi `ink`, lo `ink-muted`) › `wx-figs` (`data` mono) › ComfortBadge.
- Weekend days add `wx-day-weekend`: top rule `accent`, weekday in `accent-ink`. That is the only accent on the card.
- Layout: seven columns from 1024px; below that, a horizontal scroll-snap row with today first. Cards are focusable and open the day's detail.
